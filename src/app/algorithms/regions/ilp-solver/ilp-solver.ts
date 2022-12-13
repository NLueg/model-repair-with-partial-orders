import { GLPK, LP, Result } from 'glpk.js';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

import { Arc } from '../../../classes/diagram/arc';
import { PetriNet } from '../../../classes/diagram/petri-net';
import { Transition } from '../../../classes/diagram/transition';
import { ConstraintsWithNewVariables } from '../../../stuff/algorithms/petri-net/prime-miner/regions/petri-net-region/constraints-with-new-variables';
import { ProblemSolution } from '../../../stuff/algorithms/petri-net/prime-miner/regions/petri-net-region/region-ilp-solver';
import { RegionsConfiguration } from '../../../stuff/algorithms/petri-net/prime-miner/regions/regions-configuration';
import { Bound } from '../../../stuff/models/glpk/bound';
import { Constraint } from '../../../stuff/models/glpk/glpk-constants';
import { SubjectTo } from '../../../stuff/models/glpk/subject-to';
import { Variable } from '../../../stuff/models/glpk/variable';
import { arraify } from '../../../stuff/utility/arraify';
import { Goal, MessageLevel, Solution } from './glpk-constants';

export interface CombinationResult {
  net: PetriNet;
  inputs: Array<Set<string>>;
  outputs: Array<Set<string>>;
}

export class IlpSolver {
  // k and K defined as per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/
  // for some reason k = 2^19 while not large enough to cause precision problems in either doubles or integers
  // has caused the iterative algorithm to loop indefinitely, presumably because of some precision error in the implementation of the solver
  private readonly k = (1 << 10) - 1; // 2^10 - 1
  private readonly K = 2 * this.k + 1;

  private variableCount = 0;
  private constraintCount = 0;
  private currentVariables: string[] = [];

  private _allVariables: Set<string>;
  private _placeVariables: Set<string>;

  constructor(private glpk: GLPK) {
    this._allVariables = new Set<string>();
    this._placeVariables = new Set<string>();
  }

  // TODO: How to get the event log into this?! - This currently only the initial petri net
  // TODO: Probably you need to combine the event log with the petri net
  computeRegions(
    nets: PetriNet,
    config: RegionsConfiguration
  ): Observable<void> {
    const ilp$ = new BehaviorSubject(this.setUpInitialILP(nets, config));
    ilp$
      .pipe(switchMap((ilp) => this.solveILP(ilp)))
      .subscribe(({ lp, result }) => {
        if (result.result.status === Solution.OPTIMAL) {
          // Result contains the marking for each net
          // const region = this._regionTransformer.displayRegionInNet(
          //   ps.solution,
          //   combined.net
          // );

          // TODO check if the region is new and we are not trapped in a loop

          // TODO-XXXXX: Debug whats the result here?!
          ilp$.next(this.addConstraintsToILP({ ilp: lp, solution: result }));
        } else {
          // we are done, there are no more regions
          console.debug('final non-optimal result', result);
          // regions$.complete();
          ilp$.complete();
        }
        console.log(result);
      });
    return of(undefined);
  }

  private addConstraintsToILP(ps: ProblemSolution): LP {
    const ilp = ps.ilp;

    // no region that contains the new solution as subset
    const region = ps.solution.result.vars;
    const regionPlaces = Object.entries(region).filter(
      ([k, v]) => v != 0 && this._placeVariables.has(k)
    );
    const additionalConstraints = regionPlaces.map(([k, v]) =>
      this.yWhenAGreaterEqualB(k, v)
    );

    const yVariables = additionalConstraints
      .reduce((arr, constraint) => {
        arr.push(...constraint.binaryVariables);
        return arr;
      }, [] as Array<string>)
      .map((y) => this.variable(y));
    /*
        Sum of x-es should be less than their number
        x = 1 - y
        Therefore sum of y should be greater than 0
     */
    additionalConstraints.push(this.sumGreaterThan(yVariables, 0));
    this.applyConstraints(
      ilp,
      ConstraintsWithNewVariables.combine(...additionalConstraints)
    );

    console.debug('solution', ps.solution.result.vars);
    console.debug('non-zero', regionPlaces);
    console.debug(
      'additional constraint',
      ilp.subjectTo[ilp.subjectTo.length - 1]
    );

    return ilp;
  }

  private solveILP(lp: LP): Promise<{ lp: LP; result: Result }> {
    return (
      this.glpk.solve(lp, {
        msglev: MessageLevel.ERROR,
      }) as unknown as Promise<Result>
    ).then((result) => ({ lp, result }));
  }

  private setUpInitialILP(net: PetriNet, config: RegionsConfiguration): LP {
    this._placeVariables = new Set(net.places.map((p) => p.id));
    this._allVariables = new Set<string>(this._placeVariables);

    const initial: LP = {
      name: 'ilp',
      objective: {
        name: 'region',
        direction: Goal.MINIMUM,
        vars: net.places.map((p) => ({ name: p.id, coef: 1 })),
      },
      subjectTo: [],
      generals: Array.from(new Set(net.places.map((p) => p.id))),
    };
    this.applyConstraints(initial, this.createInitialConstraints(net, config));

    console.log(initial);
    return initial;
  }

  // TODO: Welche Gleichungen ?!
  // TODO: Offene Fragen
  // - Wie werden die Plätze hinzugefügt basierend auf den Berechnungen?
  private createInitialConstraints(
    net: PetriNet,
    config: RegionsConfiguration
  ): ConstraintsWithNewVariables {
    const result: Array<ConstraintsWithNewVariables> = [];

    // only non-negative solutions
    result.push(
      ...net.places.map((p) =>
        this.greaterEqualThan({ name: p.id, coef: 0 }, 0)
      )
    );

    // non-zero solutions
    result.push(
      this.greaterEqualThan(
        net.places.map((p) => ({ name: p.id, coef: 1 })),
        1
      )
    );

    // Eingehende Gewichte >= Benögtigte Tokens
    // Eingehende Gewichte - Konsumierende Gewichte + produzierende Gewichte = Ausgehende Kanten

    /*
    // initial markings must be the same
    if (combined.inputs.length > 1) {
      const nonemptyInputs = combined.inputs.filter(
        (inputs) => inputs.size !== 0
      );
      const inputsA = Array.from(nonemptyInputs[0]);
      for (let i = 1; i < nonemptyInputs.length; i++) {
        const inputsB = Array.from(nonemptyInputs[i]);
        result.push(
          this.sumEqualsZero(
            ...inputsA.map((id) => this.variable(id, 1)),
            ...inputsB.map((id) => this.variable(id, -1))
          )
        );
      }
    }*/

    // places with no post-set should be empty
    if (config.noOutputPlaces) {
      result.push(
        ...net.places
          .filter((p) => p.outgoingArcs.length === 0)
          .map((p) => this.lessEqualThan({ name: p.id, coef: 1 }, 0))
      );
    }

    // gradient constraints
    const labels = this.collectTransitionByLabel(net);
    const riseSumVariables: Array<Variable> = [];
    const absoluteRiseSumVariables: Array<string> = [];

    for (const [_, transitions] of labels.entries()) {
      const transitionsWithSameLabel = transitions.length;
      const t1 = transitions.splice(0, 1)[0];

      if (config.obtainPartialOrders) {
        // t1 post-set
        riseSumVariables.push(
          ...this.createVariablesFromPlaceIds(
            t1.outgoingArcs.map((a: Arc) => a.target),
            1
          )
        );
        // t1 pre-set
        riseSumVariables.push(
          ...this.createVariablesFromPlaceIds(
            t1.incomingArcs.map((a: Arc) => a.source),
            -1
          )
        );

        const singleRiseVariables = this.createVariablesFromPlaceIds(
          t1.outgoingArcs.map((a: Arc) => a.target),
          1
        );
        singleRiseVariables.push(
          ...this.createVariablesFromPlaceIds(
            t1.incomingArcs.map((a: Arc) => a.source),
            -1
          )
        );

        const singleRise = this.combineCoefficients(singleRiseVariables);
        const abs = this.helperVariableName('abs');
        const absoluteRise = this.xAbsoluteOfSum(abs, singleRise);

        absoluteRiseSumVariables.push(abs);
        result.push(
          ConstraintsWithNewVariables.combineAndIntroduceVariables(
            undefined,
            abs,
            absoluteRise
          )
        );
      }

      if (transitionsWithSameLabel === 1) {
        continue;
      }

      for (const t2 of transitions) {
        // t1 post-set
        let variables = this.createVariablesFromPlaceIds(
          t1.outgoingArcs.map((a) => a.target),
          1
        );
        // t1 pre-set
        variables.push(
          ...this.createVariablesFromPlaceIds(
            t1.incomingArcs.map((a) => a.source),
            -1
          )
        );
        // t2 post-set
        variables.push(
          ...this.createVariablesFromPlaceIds(
            t2.outgoingArcs.map((a) => a.target),
            -1
          )
        );
        // t2 pre-set
        variables.push(
          ...this.createVariablesFromPlaceIds(
            t2.incomingArcs.map((a) => a.source),
            1
          )
        );

        variables = this.combineCoefficients(variables);

        result.push(this.sumEqualsZero(...variables));
      }
    }

    if (config.obtainPartialOrders) {
      // Sum of rises should be 0 AND Sum of absolute rises should be 2 (internal places)
      //           OR
      //           Sum of absolute rises should be 1 (initial and final places)

      // sum of rises is 0
      const riseSumIsZero = this.helperVariableName('riseEqualZero');
      result.push(
        this.xWhenAEqualsB(
          riseSumIsZero,
          this.combineCoefficients(riseSumVariables),
          0
        )
      );
      // sum of absolute values of rises is 2
      const absRiseSumIsTwo = this.helperVariableName('absRiseSumTwo');
      result.push(
        this.xWhenAEqualsB(absRiseSumIsTwo, absoluteRiseSumVariables, 2)
      );
      // sum is 0 AND sum absolute is 2
      const internalPlace = this.helperVariableName('placeIsInternal');
      result.push(
        ConstraintsWithNewVariables.combineAndIntroduceVariables(
          [riseSumIsZero, absRiseSumIsTwo],
          undefined,
          this.xAandB(internalPlace, riseSumIsZero, absRiseSumIsTwo)
        )
      );

      // sum of absolute values of rise is 1
      const absRiseSumIsOne = this.helperVariableName('absRiseSumOne');
      result.push(
        this.xWhenAEqualsB(absRiseSumIsOne, absoluteRiseSumVariables, 1)
      );

      // place is internal OR place is initial/final
      const internalOrFinal = this.helperVariableName('internalOrFinal');
      result.push(
        ConstraintsWithNewVariables.combineAndIntroduceVariables(
          [internalPlace, absRiseSumIsOne, internalOrFinal],
          undefined,
          this.xAorB(internalOrFinal, internalPlace, absRiseSumIsOne)
        )
      );

      // place is internal OR place is initial/final must be true
      result.push(this.equal(this.variable(internalOrFinal), 1));
    }

    return ConstraintsWithNewVariables.combine(...result);
  }

  private createVariablesFromPlaceIds(
    placeIds: Array<string>,
    coefficient: number
  ): Array<Variable> {
    return placeIds.map((id) => ({ name: id, coef: coefficient }));
  }

  private applyConstraints(ilp: LP, constraints: ConstraintsWithNewVariables) {
    if (ilp.subjectTo === undefined) {
      ilp.subjectTo = [];
    }
    ilp.subjectTo.push(...constraints.constraints);

    if (ilp.binaries === undefined) {
      ilp.binaries = [];
    }
    ilp.binaries.push(...constraints.binaryVariables);

    if (ilp.generals === undefined) {
      ilp.generals = [];
    }
    ilp.generals.push(...constraints.integerVariables);
  }

  private collectTransitionByLabel(
    net: PetriNet
  ): Map<string, Array<Transition>> {
    const result = new Map<string, Array<Transition>>();
    for (const t of net.transitions) {
      if (t.label === undefined) {
        throw new Error(
          `Transition with id '${t.id}' has no label! All transitions must be labeled in the input net!`
        );
      }
      const array = result.get(t.label);
      if (array === undefined) {
        result.set(t.label, [t]);
      } else {
        array.push(t);
      }
    }
    return result;
  }

  private combineCoefficients(variables: Array<Variable>): Array<Variable> {
    const map = new Map<string, number>();
    for (const variable of variables) {
      const coef = map.get(variable.name);
      if (coef !== undefined) {
        map.set(variable.name, coef + variable.coef);
      } else {
        map.set(variable.name, variable.coef);
      }
    }

    const result: Array<Variable> = [];
    for (const [name, coef] of map) {
      if (coef === 0) {
        continue;
      }
      result.push({ name, coef });
    }
    return result;
  }

  private helperVariableName(prefix = 'y'): string {
    let helpVariableName;
    do {
      helpVariableName = `${prefix}${this.variableCount++}`;
    } while (this.currentVariables.includes(helpVariableName));
    this.currentVariables.push(helpVariableName);
    return helpVariableName;
  }

  private xAbsoluteOfSum(
    x: string,
    sum: Array<Variable>
  ): ConstraintsWithNewVariables {
    /*
     * As per https://blog.adamfurmanek.pl/2015/09/19/ilp-part-5/
     *
     * x >= 0
     * (x + sum is 0) or (x - sum is 0) = 1
     *
     */

    const y = this.helperVariableName('yAbsSum'); // x + sum is 0
    const z = this.helperVariableName('zAbsSum'); // x - sym is 0
    const w = this.helperVariableName('wAbsSum'); // y or z

    return ConstraintsWithNewVariables.combineAndIntroduceVariables(
      w,
      undefined,
      // x >= 0
      this.greaterEqualThan(this.variable(x), 0),
      // w is y or z
      this.xAorB(w, y, z),
      // w is true
      this.equal(this.variable(w), 1),
      // x + sum is 0
      this.xWhenAEqualsB(
        y,
        [this.variable(x), ...sum.map((a) => this.createOrCopyVariable(a))],
        0
      ),
      // x - sum is 0
      this.xWhenAEqualsB(
        z,
        [this.variable(x), ...sum.map((a) => this.createOrCopyVariable(a, -1))],
        0
      )
    );
  }

  private xWhenAEqualsB(
    x: string,
    a: string | Array<string> | Array<Variable>,
    b: string | number
  ): ConstraintsWithNewVariables {
    /*
         As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/

         x is a equals b <=> a greater equal than b and a less equal than b
     */

    const y = this.helperVariableName('yWhenEquals');
    const z = this.helperVariableName('zWhenEquals');

    const aGreaterEqualB = this.xWhenAGreaterEqualB(y, a, b);
    const aLessEqualB = this.xWhenALessEqualB(z, a, b);

    return ConstraintsWithNewVariables.combineAndIntroduceVariables(
      [x, y],
      undefined,
      aGreaterEqualB,
      aLessEqualB,
      this.xAandB(x, y, z)
    );
  }

  private yWhenAGreaterEqualB(
    a: string,
    b: number
  ): ConstraintsWithNewVariables {
    /*
        As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/ and https://blog.adamfurmanek.pl/2015/08/22/ilp-part-1/
        x = a >= b can be defined as !(b > a)
        the negation for binary variables can be expressed as (for x = !y both binary) x = 1 - y
        the 1 - y form can be extracted and added to the constraint that puts all help variables together, therefore we only need to express y = b > a
        for |a|,|b| <= k and K = 2k + 1
        y = b > a can be expressed as:
        a - b + Ky >= 0
        a - b + Ky <= K-1

        in our case b is always a constant given by the solution (region)
        therefore we only have a and y as our variables which gives:
        a + Ky >= b
        a + Ky <= K-1 + b
     */
    const y = this.helperVariableName();

    if (b > this.k) {
      console.debug('b', b);
      console.debug('k', this.k);
      throw new Error(
        'b > k. This implementation can only handle solutions that are at most k'
      );
    }

    return ConstraintsWithNewVariables.combineAndIntroduceVariables(
      [y],
      undefined,
      this.greaterEqualThan([this.variable(a), this.variable(y, this.K)], b),
      this.lessEqualThan(
        [this.variable(a), this.variable(y, this.K)],
        this.K - 1 + b
      )
    );
  }

  private xWhenAGreaterEqualB(
    x: string,
    a: string | Array<string> | Array<Variable>,
    b: string | number
  ): ConstraintsWithNewVariables {
    /*
        As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/

        a is greater equal b <=> not a less than b
     */

    const z = this.helperVariableName('zALessB');

    return ConstraintsWithNewVariables.combineAndIntroduceVariables(
      z,
      undefined,
      // z when a less than b
      this.xWhenALessB(z, a, b),
      // x not z
      this.xNotA(x, z)
    );
  }

  private xWhenALessEqualB(
    x: string,
    a: string | Array<string> | Array<Variable>,
    b: string | number
  ): ConstraintsWithNewVariables {
    /*
        As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/

        a is less equal b <=> not a greater than b
     */

    const z = this.helperVariableName('zAGreaterB');

    return ConstraintsWithNewVariables.combineAndIntroduceVariables(
      z,
      undefined,
      // z when a greater than b
      this.xWhenAGreaterB(z, a, b),
      // x not z
      this.xNotA(x, z)
    );
  }

  private xWhenAGreaterB(
    x: string,
    a: string | Array<string> | Array<Variable> | number,
    b: string | Array<string> | Array<Variable> | number
  ): ConstraintsWithNewVariables {
    /*
        As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/
        a,b integer
        |a|,|b| <= k
        k = 2^n - 1, n natural
        K = 2k + 1
        x binary

        0 <= b - a + Kx <= K - 1
     */

    let aIsVariable = false;
    let bIsVariable = false;
    if (typeof a === 'string' || Array.isArray(a)) {
      aIsVariable = true;
      if (typeof a === 'string') {
        a = arraify(a);
      }
    }
    if (typeof b === 'string' || Array.isArray(b)) {
      bIsVariable = true;
      if (typeof b === 'string') {
        b = arraify(b);
      }
    }

    if (aIsVariable && bIsVariable) {
      return ConstraintsWithNewVariables.combine(
        // b - a + Kx >= 0
        this.greaterEqualThan(
          [
            ...(b as Array<string> | Array<Variable>).map((b) =>
              this.createOrCopyVariable(b)
            ),
            ...(a as Array<string> | Array<Variable>).map((a) =>
              this.createOrCopyVariable(a, -1)
            ),
            this.variable(x, this.K),
          ],
          0
        ),
        // b - a + Kx <= K - 1
        this.lessEqualThan(
          [
            ...(b as Array<string> | Array<Variable>).map((b) =>
              this.createOrCopyVariable(b)
            ),
            ...(a as Array<string> | Array<Variable>).map((a) =>
              this.createOrCopyVariable(a, -1)
            ),
            this.variable(x, this.K),
          ],
          this.K - 1
        )
      );
    } else if (aIsVariable && !bIsVariable) {
      return ConstraintsWithNewVariables.combine(
        // -a + Kx >= -b
        this.greaterEqualThan(
          [
            ...(a as Array<string> | Array<Variable>).map((a) =>
              this.createOrCopyVariable(a, -1)
            ),
            this.variable(x, this.K),
          ],
          -b
        ),
        // -a + Kx <= K - b - 1
        this.lessEqualThan(
          [
            ...(a as Array<string> | Array<Variable>).map((a) =>
              this.createOrCopyVariable(a, -1)
            ),
            this.variable(x, this.K),
          ],
          this.K - (b as number) - 1
        )
      );
    } else if (!aIsVariable && bIsVariable) {
      return ConstraintsWithNewVariables.combine(
        // b + Kx >= a
        this.greaterEqualThan(
          [
            ...(b as Array<string> | Array<Variable>).map((b) =>
              this.createOrCopyVariable(b)
            ),
            this.variable(x, this.K),
          ],
          a as number
        ),
        // b + Kx <= K + a - 1
        this.lessEqualThan(
          [
            ...(b as Array<string> | Array<Variable>).map((b) =>
              this.createOrCopyVariable(b)
            ),
            this.variable(x, this.K),
          ],
          this.K + (a as number) - 1
        )
      );
    } else {
      throw new Error(`unsupported comparison! x when ${a} > ${b}`);
    }
  }

  private xWhenALessB(
    x: string,
    a: string | Array<string> | Array<Variable>,
    b: string | number
  ): ConstraintsWithNewVariables {
    /*
        As per https://blog.adamfurmanek.pl/2015/09/12/ilp-part-4/

        a is less than b <=> b is greater than a
     */
    return this.xWhenAGreaterB(x, b, a);
  }

  private xAandB(x: string, a: string, b: string): ConstraintsWithNewVariables {
    /*
        As per http://blog.adamfurmanek.pl/2015/08/22/ilp-part-1/
        a,b,x binary

        0 <= a + b - 2x <= 1
     */
    return ConstraintsWithNewVariables.combine(
      // a + b -2x >= 0
      this.greaterEqualThan(
        [this.variable(a), this.variable(b), this.variable(x, -2)],
        0
      ),
      // a + b -2x <= 1
      this.lessEqualThan(
        [this.variable(a), this.variable(b), this.variable(x, -2)],
        1
      )
    );
  }

  private xAorB(x: string, a: string, b: string): ConstraintsWithNewVariables {
    /*
        As per http://blog.adamfurmanek.pl/2015/08/22/ilp-part-1/
        a,b,x binary

        -1 <= a + b - 2x <= 0
     */
    return ConstraintsWithNewVariables.combine(
      // a + b -2x >= -1
      this.greaterEqualThan(
        [this.variable(a), this.variable(b), this.variable(x, -2)],
        -1
      ),
      // a + b -2x <= 0
      this.lessEqualThan(
        [this.variable(a), this.variable(b), this.variable(x, -2)],
        0
      )
    );
  }

  private xNotA(x: string, a: string): ConstraintsWithNewVariables {
    /*
        As per http://blog.adamfurmanek.pl/2015/08/22/ilp-part-1/
        a,x binary

        x = 1 - a
     */
    // x + a = 1
    return this.equal([this.variable(x), this.variable(a)], 1);
  }

  private createOrCopyVariable(
    original: string | Variable,
    coefficient = 1
  ): Variable {
    if (typeof original === 'string') {
      return this.variable(original, coefficient);
    } else {
      return this.variable(original.name, original.coef * coefficient);
    }
  }

  private variable(name: string, coefficient = 1): Variable {
    return { name, coef: coefficient };
  }

  private equal(
    variables: Variable | Array<Variable>,
    value: number
  ): ConstraintsWithNewVariables {
    return new ConstraintsWithNewVariables(
      this.constrain(arraify(variables), {
        type: Constraint.FIXED_VARIABLE,
        ub: value,
        lb: value,
      })
    );
  }

  private greaterEqualThan(
    variables: Variable | Array<Variable>,
    lowerBound: number
  ): ConstraintsWithNewVariables {
    return new ConstraintsWithNewVariables(
      this.constrain(arraify(variables), {
        type: Constraint.LOWER_BOUND,
        ub: 0,
        lb: lowerBound,
      })
    );
  }

  private lessEqualThan(
    variables: Variable | Array<Variable>,
    upperBound: number
  ): ConstraintsWithNewVariables {
    return new ConstraintsWithNewVariables(
      this.constrain(arraify(variables), {
        type: Constraint.UPPER_BOUND,
        ub: upperBound,
        lb: 0,
      })
    );
  }

  private sumEqualsZero(
    ...variables: Array<Variable>
  ): ConstraintsWithNewVariables {
    return this.equal(variables, 0);
  }

  private sumGreaterThan(
    variables: Array<Variable>,
    lowerBound: number
  ): ConstraintsWithNewVariables {
    return this.greaterEqualThan(variables, lowerBound + 1);
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
}
