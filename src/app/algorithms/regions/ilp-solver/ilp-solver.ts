import { GLPK, LP, Result } from 'glpk.js';
import clonedeep from 'lodash.clonedeep';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  ReplaySubject,
  switchMap,
  tap,
} from 'rxjs';

import { PartialOrder } from '../../../classes/diagram/partial-order';
import { PetriNet } from '../../../classes/diagram/petri-net';
import { EventItem } from '../../../classes/diagram/transition';
import { arraify } from '../arraify';
import { ConstraintsWithNewVariables } from './constraints-with-new-variables';
import { DirectlyFollowsExtractor } from './directly-follows-extractor';
import {
  Bound,
  ProblemSolution,
  ProblemSolutionWithoutType,
  SolutionType,
  SolutionVariable,
  SubjectTo,
  Variable,
  VariableName,
  VariableType,
} from './solver-classes';
import { Constraint, Goal, MessageLevel, Solution } from './solver-constants';

export class IlpSolver {
  // k and K defined as per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/
  // for some reason k = 2^19 while not large enough to cause precision problems in either doubles or integers
  // has caused the iterative algorithm to loop indefinitely, presumably because of some precision error in the implementation of the solver
  private readonly k = (1 << 10) - 1; // 2^10 - 1
  private readonly K = 2 * this.k + 1;

  private readonly PO_ARC_SEPARATOR = '_';
  private readonly FINAL_MARKING = 'mf';

  private variableCount = 0;
  private constraintCount = 0;

  private readonly _allVariables: Set<string>;
  private readonly _poVariableNames: Set<string>;

  private readonly _labelVariableMapIngoing: Map<string, string>;
  private readonly _labelVariableMapOutgoing: Map<string, string>;
  private readonly _inverseLabelVariableMapIngoing: Map<string, string>;
  private readonly _inverseLabelVariableMapOutgoing: Map<string, string>;
  private readonly _directlyFollowsExtractor: DirectlyFollowsExtractor;

  private baseIlp: LP;
  private baseConstraints: Array<SubjectTo>;
  private pairs: Array<[first: string | undefined, second: string]>;

  constructor(
    private glpk: GLPK,
    private partialOrders: Array<PartialOrder>,
    private petriNet: PetriNet
  ) {
    this._directlyFollowsExtractor = new DirectlyFollowsExtractor();
    this._allVariables = new Set<string>();
    this._poVariableNames = new Set<string>();
    this._labelVariableMapIngoing = new Map<string, string>();
    this._labelVariableMapOutgoing = new Map<string, string>();
    this._inverseLabelVariableMapIngoing = new Map<string, string>();
    this._inverseLabelVariableMapOutgoing = new Map<string, string>();

    this.baseConstraints = this.buildBasicIlpForPartialOrders(partialOrders);

    this.baseIlp = this.setUpBaseIlp();

    this.pairs = this._directlyFollowsExtractor.oneWayDirectlyFollows();
  }

  computeSolutions(invalidPlaceId: string): Observable<ProblemSolution[]> {
    const validPlaces = this.petriNet.places.filter(
      (p) => p.id !== invalidPlaceId
    );
    const pairsThatArentHandled = this.pairs.filter(
      ([source, target]) =>
        !validPlaces.some(
          (p) =>
            p.incomingArcs.some((incoming) => incoming.source === source) &&
            p.outgoingArcs.some((outgoing) => outgoing.target === target)
        )
    );

    // Handle initial place(s)
    const invalidPlace = this.petriNet.places.find(
      (p) => p.id === invalidPlaceId
    );
    if (
      pairsThatArentHandled.length === 0 &&
      invalidPlace &&
      invalidPlace.incomingArcs.length === 0
    ) {
      invalidPlace.outgoingArcs.forEach((outgoing) => {
        pairsThatArentHandled.push([undefined, outgoing.target]);
      });
    }

    const problems = pairsThatArentHandled.map((pair) => ({
      baseConstraints: this.baseConstraints,
      baseIlp: this.baseIlp,
      pair,
    }));

    return from(problems).pipe(
      switchMap((problem) =>
        this.solveILP(
          this.populateIlpByCausalPairs(
            problem.baseIlp,
            problem.baseConstraints,
            problem.pair
          )
        ).pipe(
          switchMap((solution) => {
            const unboundSolution = {
              type: 'unbounded' as SolutionType,
              ilp: solution.ilp,
              solution: solution.solution,
            };

            if (solution.solution.result.status === Solution.NO_SOLUTION) {
              return of([unboundSolution]);
            }

            return combineLatest([
              this.solveILP(
                this.populateIlpBySameIncomingWeights(
                  problem.baseIlp,
                  problem.baseConstraints,
                  problem.pair
                )
              ).pipe(
                map((solution) => ({
                  ...solution,
                  type: 'sameIncming' as SolutionType,
                }))
              ),
              this.solveILP(
                this.populateIlpBySameOutgoingWeights(
                  problem.baseIlp,
                  problem.baseConstraints,
                  problem.pair
                )
              ).pipe(
                map((solution) => ({
                  ...solution,
                  type: 'sameOutgoing' as SolutionType,
                }))
              ),
              this.solveILP(
                this.populateIlpBySameWeights(
                  problem.baseIlp,
                  problem.baseConstraints,
                  problem.pair
                )
              ).pipe(
                map((solution) => ({
                  ...solution,
                  type: 'arcsSame' as SolutionType,
                }))
              ),
            ]).pipe(
              map((solutions) => {
                const foundSolutions = [unboundSolution, ...solutions];

                // Removes duplicate solutions
                return foundSolutions.filter((value, index) => {
                  const _value = JSON.stringify(value.solution.result.vars);
                  return (
                    index ===
                    foundSolutions.findIndex((obj) => {
                      return (
                        JSON.stringify(obj.solution.result.vars) === _value
                      );
                    })
                  );
                });
              })
            );
          })
        )
      ),
      tap((solution) => {
        console.log(
          'Solutions',
          JSON.stringify(
            solution.map((solution) => solution),
            null,
            2
          )
        );
        console.log('Variable ingoing mapping:', this._labelVariableMapIngoing);
        console.log(
          'Variable outgoing mapping:',
          this._labelVariableMapOutgoing
        );
        console.log('PO Variable names:', this._poVariableNames);
        console.log('All variables:', this._allVariables);
      })
    );
  }

  private populateIlpByCausalPairs(
    baseIlp: LP,
    baseConstraints: Array<SubjectTo>,
    causalPair: [string | undefined, string]
  ): LP {
    const result = Object.assign({}, baseIlp);
    result.subjectTo = [...baseConstraints];

    if (causalPair[0]) {
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
    }

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

  // TODO: Implement me
  private populateIlpBySameIncomingWeights(
    baseIlp: LP,
    baseConstraints: Array<SubjectTo>,
    causalPair: [string | undefined, string]
  ): LP {
    const result = clonedeep(baseIlp);
    return this.populateIlpByCausalPairs(result, baseConstraints, causalPair);
  }

  // TODO: Implement me
  private populateIlpBySameOutgoingWeights(
    baseIlp: LP,
    baseConstraints: Array<SubjectTo>,
    causalPair: [string | undefined, string]
  ): LP {
    const result = clonedeep(baseIlp);
    return this.populateIlpByCausalPairs(result, baseConstraints, causalPair);
  }

  // TODO: Implement me
  private populateIlpBySameWeights(
    baseIlp: LP,
    baseConstraints: Array<SubjectTo>,
    causalPair: [string | undefined, string]
  ): LP {
    const result = clonedeep(baseIlp);
    return this.populateIlpByCausalPairs(result, baseConstraints, causalPair);
  }

  protected solveILP(ilp: LP): Observable<ProblemSolutionWithoutType> {
    const result$ = new ReplaySubject<ProblemSolutionWithoutType>(1);

    const result = this.glpk.solve(ilp, {
      msglev: MessageLevel.ERROR,
    });

    const res = result instanceof Promise ? result : Promise.resolve(result);
    res
      .then((solution: Result) => {
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
        console.warn(`___ Start Event ${e.id} ___`);
        baseIlpConstraints.push(...this.firingRule(e, i, partialOrders[i]));
        baseIlpConstraints.push(...this.tokenFlow(e, i));
        console.warn(`________________________`);
      }
      baseIlpConstraints.push(...this.initialMarking(events, i));
    }

    return baseIlpConstraints;
  }

  private setUpBaseIlp(): LP {
    const generals = Array.from(this._poVariableNames);
    generals.push(VariableName.INITIAL_MARKING);

    const allVariables = Array.from(this._allVariables);
    allVariables.push(VariableName.INITIAL_MARKING);

    return {
      name: 'ilp',
      objective: {
        name: 'goal',
        direction: Goal.MINIMUM,
        vars: allVariables.map((v) => {
          return this.variable(v, 1);
        }),
      },
      subjectTo: [],
      // General variables
      generals,
    };
  }

  private firingRule(
    event: EventItem,
    i: number,
    partialOrder: PartialOrder
  ): Array<SubjectTo> {
    const variables = [this.variable(this.getPoEventId(event.id, i))];
    for (const pre of event.previousEvents) {
      variables.push(this.variable(this.getPoArcId(pre, event.id, i)));

      const preLabel = partialOrder.events.find((e) => e.id === pre)?.label;
      if (!preLabel) {
        throw Error('Predecessor label not found!');
      }
      this._directlyFollowsExtractor.add(event.label, preLabel);
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
    for (const pre of event.previousEvents) {
      variables.push(this.variable(this.getPoArcId(pre, event.id, i)));
    }
    for (const post of event.nextEvents) {
      variables.push(this.variable(this.getPoArcId(event.id, post, i), -1));
    }
    if (event.nextEvents.length === 0) {
      variables.push(
        this.variable(this.getPoArcId(event.id, this.FINAL_MARKING, i), -1)
      );
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
    variables.push(
      this.variable(
        this.transitionVariableName(
          event.label!,
          VariableName.OUTGOING_ARC_WEIGHT_PREFIX
        )
      )
    );
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

  public getInverseVariableMapping(variable: string): SolutionVariable | null {
    if (variable === VariableName.INITIAL_MARKING) {
      return {
        label: VariableName.INITIAL_MARKING,
        type: VariableType.INITIAL_MARKING,
      };
    } else if (variable.startsWith(VariableName.INGOING_ARC_WEIGHT_PREFIX)) {
      const label = this._inverseLabelVariableMapIngoing.get(variable);
      if (label === undefined) {
        throw new Error(
          `ILP variable '${variable}' could not be resolved to an ingoing transition label!`
        );
      }
      return {
        label,
        type: VariableType.OUTGOING_TRANSITION_WEIGHT,
      };
    } else if (variable.startsWith(VariableName.OUTGOING_ARC_WEIGHT_PREFIX)) {
      const label = this._inverseLabelVariableMapOutgoing.get(variable);
      if (label === undefined) {
        throw new Error(
          `ILP variable '${variable}' could not be resolved to an outgoing transition label!`
        );
      }
      return {
        label,
        type: VariableType.INCOMING_TRANSITION_WEIGHT,
      };
    }
    return null;
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
    const id = `${i}${this.PO_ARC_SEPARATOR}Arc${this.PO_ARC_SEPARATOR}${sourceId}${this.PO_ARC_SEPARATOR}to${this.PO_ARC_SEPARATOR}${destinationId}`;
    this._poVariableNames.add(id);
    return id;
  }

  /**
   * Gets variable name for transition
   * @param label transition label
   * @param prefix prefix for variable name
   * @protected
   */
  protected transitionVariableName(
    label: string,
    prefix:
      | VariableName.OUTGOING_ARC_WEIGHT_PREFIX
      | VariableName.INGOING_ARC_WEIGHT_PREFIX
  ): string {
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

    const name = this.helperVariableName(label, prefix);
    map.set(label, name);
    inverseMap.set(name, label);
    return name;
  }

  protected helperVariableName(label: string, prefix: string): string {
    let helpVariableName;
    do {
      helpVariableName = `${prefix}${this.PO_ARC_SEPARATOR}${label}${
        this.PO_ARC_SEPARATOR
      }${this.variableCount++}`;
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
