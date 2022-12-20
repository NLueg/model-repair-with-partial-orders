import { GLPK, LP, Result } from 'glpk.js';
import { concatMap, from, Observable, of, ReplaySubject, toArray } from 'rxjs';

import { PartialOrder } from '../../../classes/diagram/partial-order';
import { PetriNet } from '../../../classes/diagram/petri-net';
import { EventItem } from '../../../classes/diagram/transition';
import { ConstraintsWithNewVariables } from '../../../stuff/algorithms/petri-net/prime-miner/regions/petri-net-region/constraints-with-new-variables';
import { ProblemSolution } from '../../../stuff/algorithms/petri-net/prime-miner/regions/petri-net-region/region-ilp-solver';
import { Bound } from '../../../stuff/models/glpk/bound';
import { VariableName } from '../../../stuff/models/glpk/glpk-constants';
import { SubjectTo } from '../../../stuff/models/glpk/subject-to';
import { Variable } from '../../../stuff/models/glpk/variable';
import { DirectlyFollowsExtractor } from './directly-follows-extractor';
import { Constraint, Goal, MessageLevel } from './glpk-constants';

export interface CombinationResult {
  net: PetriNet;
  inputs: Array<Set<string>>;
  outputs: Array<Set<string>>;
}

interface Region {
  net: PetriNet;
  inputs: Array<string>;
}

export class IlpSolver {
  // k and K defined as per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/
  // for some reason k = 2^19 while not large enough to cause precision problems in either doubles or integers
  // has caused the iterative algorithm to loop indefinitely, presumably because of some precision error in the implementation of the solver
  private readonly k = (1 << 10) - 1; // 2^10 - 1
  private readonly K = 2 * this.k + 1;

  private readonly PO_ARC_SEPARATOR = '#';
  private readonly FINAL_MARKING = 'mf';

  private variableCount = 0;
  private constraintCount = 0;

  private readonly _allVariables: Set<string>;
  private readonly _placeVariables: Set<string>;
  private readonly _poVariableNames: Set<string>;

  private readonly _labelVariableMapIngoing: Map<string, string>;
  private readonly _labelVariableMapOutgoing: Map<string, string>;
  private readonly _inverseLabelVariableMapIngoing: Map<string, string>;
  private readonly _inverseLabelVariableMapOutgoing: Map<string, string>;
  private readonly _directlyFollowsExtractor: DirectlyFollowsExtractor;

  constructor(private glpk: GLPK) {
    this._directlyFollowsExtractor = new DirectlyFollowsExtractor();
    this._allVariables = new Set<string>();
    this._placeVariables = new Set<string>();
    this._poVariableNames = new Set<string>();
    this._labelVariableMapIngoing = new Map<string, string>();
    this._labelVariableMapOutgoing = new Map<string, string>();
    this._inverseLabelVariableMapIngoing = new Map<string, string>();
    this._inverseLabelVariableMapOutgoing = new Map<string, string>();
  }

  // TODO: How to get the event log into this?! - This currently only the initial petri net
  // TODO: Probably you need to combine the event log with the petri net
  computeRegions(
    partialOrders: Array<PartialOrder>,
    petriNet: PetriNet,
    placeIdToCheck: string
  ): Observable<void> {
    const baseConstraints = this.buildBasicIlpForPartialOrders(partialOrders);

    const baseIlp = this.setUpBaseIlp();

    const problems = this._directlyFollowsExtractor
      .oneWayDirectlyFollows()
      .map((pair) => ({
        baseConstraints,
        baseIlp,
        pair,
      }));

    console.log(problems);
    from(problems)
      .pipe(
        concatMap((problem) => {
          return this.solveILP(
            this.populateIlp(
              problem.baseIlp,
              problem.baseConstraints,
              problem.pair
            )
          );
        }),
        toArray()
      )
      .subscribe((solutions) => console.warn(solutions));

    return of(undefined);
  }

  private populateIlp(
    baseIlp: LP,
    baseConstraints: Array<SubjectTo>,
    causalPair: Array<string>
  ): LP {
    const result = Object.assign({}, baseIlp);
    result.subjectTo = [...baseConstraints];
    result.subjectTo = result.subjectTo.concat(
      this.greaterEqualThan(
        this.variable(
          this.transitionVariableName(
            causalPair[0],
            VariableName.OUTGOING_ARC_WEIGHT_PREFIX
          )
        ),
        1
      ).constraints
    );
    result.subjectTo = result.subjectTo.concat(
      this.greaterEqualThan(
        this.variable(
          this.transitionVariableName(
            causalPair[1],
            VariableName.INGOING_ARC_WEIGHT_PREFIX
          )
        ),
        1
      ).constraints
    );
    return result;
  }

  protected solveILP(ilp: LP): Observable<ProblemSolution> {
    const result$ = new ReplaySubject<ProblemSolution>(1);

    console.log('Solve: ', ilp);
    const res = this.glpk.solve(ilp, {
      msglev: MessageLevel.ALL,
    }) as unknown as Promise<Result>;
    res
      .then((solution: Result) => {
        console.log('Solution: ', solution);
        result$.next({ ilp, solution });
        result$.complete();
      })
      .catch((error) => console.error(error));

    return result$.asObservable();
  }

  private buildBasicIlpForPartialOrders(
    partialOrders: Array<PartialOrder>
  ): Array<SubjectTo> {
    const baseIlpConstraints: Array<SubjectTo> = [];

    for (let i = 0; i < partialOrders.length; i++) {
      const events = partialOrders[i].events;
      for (const e of events) {
        baseIlpConstraints.push(...this.firingRule(e, i));
        baseIlpConstraints.push(...this.tokenFlow(e, i));
      }
      baseIlpConstraints.push(...this.initialMarking(events, i));
    }
    return baseIlpConstraints;
  }

  private setUpBaseIlp(): LP {
    const goalVariables = Array.from(this._allVariables).concat(
      VariableName.INITIAL_MARKING
    );
    return {
      name: 'ilp',
      objective: {
        name: 'goal',
        direction: Goal.MINIMUM,
        vars: Array.from(this._poVariableNames).map((v) => {
          return this.variable(v, 1);
        }),
      },
      subjectTo: [],
      // TODO enable arc weights with a config setting?
      binaries: goalVariables,
      generals: Array.from(this._poVariableNames),
    };
  }

  private firingRule(event: EventItem, i: number): Array<SubjectTo> {
    const variables = [this.variable(this.getPoEventId(event.id, i))];
    for (const pre of event.previousEvents) {
      variables.push(this.variable(this.getPoArcId(pre, event.id, i)));
      this._directlyFollowsExtractor.add(event.label, pre);
    }
    variables.push(
      this.variable(
        this.transitionVariableName(
          event.label!,
          VariableName.INGOING_ARC_WEIGHT_PREFIX
        ),
        -1
      )
    );
    return this.greaterEqualThan(variables, 0).constraints;
  }

  private tokenFlow(event: EventItem, i: number): Array<SubjectTo> {
    const variables = [this.variable(this.getPoEventId(event.id, i))];
    // for (const pre of event.previousEvents) {
    //   variables.push(this.variable(this.getPoArcId(pre, event.id, i)));
    // }
    // for (const post of event.nextEvents) {
    //   variables.push(this.variable(this.getPoArcId(event.id, post, i), -1));
    // }
    //     if (event.nextEvents.length === 0) {
    //       variables.push(
    //         this.variable(this.getPoArcId(event.id, this.FINAL_MARKING, i), -1)
    //       );
    //     }
    //     variables.push(
    //       this.variable(
    //         this.transitionVariableName(
    //           event.label!,
    //           VariableName.INGOING_ARC_WEIGHT_PREFIX
    //         ),
    //         -1
    //       )
    //     );
    //     variables.push(
    //       this.variable(
    //         this.transitionVariableName(
    //           event.label!,
    //           VariableName.OUTGOING_ARC_WEIGHT_PREFIX
    //         )
    //       )
    //     );
    return this.equal(variables, 0).constraints;
  }

  private initialMarking(
    events: Array<EventItem>,
    i: number
  ): Array<SubjectTo> {
    const variables = events.map((e) =>
      this.variable(this.getPoEventId(e.id, i), -1)
    );
    variables.push(this.variable(VariableName.INITIAL_MARKING));
    return this.equal(variables, 0).constraints;
  }

  private getPoEventId(id: string, i: number): string {
    const d = `${i}${this.PO_ARC_SEPARATOR}${id}`;
    this._poVariableNames.add(d);
    return d;
  }

  private getPoArcId(
    sourceId: string,
    destinationId: string,
    i: number
  ): string {
    const id = `${i}${this.PO_ARC_SEPARATOR}${sourceId}${this.PO_ARC_SEPARATOR}${destinationId}`;
    this._poVariableNames.add(id);
    return id;
  }

  protected transitionVariableName(label: string, prefix: 'x' | 'y'): string {
    let map, inverseMap;
    if (prefix === VariableName.INGOING_ARC_WEIGHT_PREFIX) {
      map = this._labelVariableMapIngoing;
      inverseMap = this._inverseLabelVariableMapIngoing;
    } else {
      map = this._labelVariableMapOutgoing;
      inverseMap = this._inverseLabelVariableMapOutgoing;
    }
    const saved = map.get(label);
    if (saved !== undefined) {
      return saved;
    }
    const name = this.helperVariableName(prefix);
    map.set(label, name);
    inverseMap.set(name, label);
    return name;
  }

  protected helperVariableName(prefix = 'y'): string {
    let helpVariableName;
    do {
      helpVariableName = `${prefix}${this.variableCount++}`;
    } while (this._allVariables.has(helpVariableName));
    this._allVariables.add(helpVariableName);
    return helpVariableName;
  }

  protected equal(
    variables: Variable | Array<Variable>,
    value: number
  ): ConstraintsWithNewVariables {
    console.debug(`${this.formatVariableList(variables)} = ${value}`);
    return new ConstraintsWithNewVariables(
      this.constrain(arraify(variables), {
        type: Constraint.FIXED_VARIABLE,
        ub: value,
        lb: value,
      })
    );
  }

  private variable(name: string, coefficient = 1): Variable {
    return { name, coef: coefficient };
  }

  private greaterEqualThan(
    variables: Variable | Array<Variable>,
    lowerBound: number
  ): ConstraintsWithNewVariables {
    console.debug(`${this.formatVariableList(variables)} >= ${lowerBound}`);
    return new ConstraintsWithNewVariables(
      this.constrain(arraify(variables), {
        type: Constraint.LOWER_BOUND,
        ub: 0,
        lb: lowerBound,
      })
    );
  }

  private constrain(vars: Array<Variable>, bnds: Bound): SubjectTo {
    return {
      name: this.constraintName(),
      vars,
      bnds,
    };
  }

  private constraintName(): string {
    return 'c' + this.constraintCount++;
  }

  private formatVariableList(variables: Variable | Array<Variable>): string {
    return arraify(variables)
      .map(
        (v) =>
          `${v.coef > 0 ? '+' : ''}${
            v.coef === -1 ? '-' : v.coef === 1 ? '' : v.coef
          }${v.name}`
      )
      .join(' ');
  }
}

function arraify<T>(a: T | Array<T>): Array<T> {
  return Array.isArray(a) ? a : [a];
}
