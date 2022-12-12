import { GLPK, LP, Result } from 'glpk.js';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

import { PetriNet } from '../../../classes/diagram/petri-net';
import { Transition } from '../../../classes/diagram/transition';
import { RegionsConfiguration } from '../../../stuff/algorithms/petri-net/prime-miner/regions/regions-configuration';
import { Bound } from '../../../stuff/models/glpk/bound';
import { Constraint } from '../../../stuff/models/glpk/glpk-constants';
import { SubjectTo } from '../../../stuff/models/glpk/subject-to';
import { Variable } from '../../../stuff/models/glpk/variable';
import { arraify } from '../../../stuff/utility/arraify';
import { Goal, MessageLevel } from './glpk-constants';

export interface CombinationResult {
  net: PetriNet;
  inputs: Array<Set<string>>;
  outputs: Array<Set<string>>;
}

export class IlpSolver {
  private constraintCount = 0;

  constructor(private glpk: GLPK) {}

  // TODO: How to get the event log into this?! - This currently only the initial petri net
  // TODO: Probably you need to combine the event log with the petri net
  computeRegions(
    nets: PetriNet,
    config: RegionsConfiguration
  ): Observable<void> {
    const ilp$ = new BehaviorSubject(this.setUpInitialILP(nets, config));
    ilp$.pipe(switchMap((ilp) => this.solveILP(ilp))).subscribe((result) => {
      console.log(result.result);
    });
    return of(undefined);
  }

  private solveILP(lp: LP): Promise<{ lp: LP; result: Result }> {
    return (
      this.glpk.solve(lp, {
        msglev: MessageLevel.ERROR,
      }) as unknown as Promise<Result>
    ).then((result) => ({ lp, result }));
  }

  private setUpInitialILP(net: PetriNet, config: RegionsConfiguration): LP {
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

    return initial;
  }

  // TODO: Welche Gleichungen ?!
  // TODO: Offene Fragen
  // - Wie werden die Plätze hinzugefügt basierend auf den Berechnungen?
  private createInitialConstraints(
    net: PetriNet,
    config: RegionsConfiguration
  ): Array<SubjectTo> {
    const result: Array<SubjectTo> = [];

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
    }

    // places with no post-set should be empty
    if (config.noOutputPlaces) {
      result.push(
        ...net
          .getPlaces()
          .filter((p) => p.outgoingArcs.length === 0)
          .map((p) => this.lessEqualThan(this.variable(p.getId()), 0))
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
            t1.outgoingArcs.map((a: Arc) => a.destinationId),
            1
          )
        );
        // t1 pre-set
        riseSumVariables.push(
          ...this.createVariablesFromPlaceIds(
            t1.ingoingArcs.map((a: Arc) => a.sourceId),
            -1
          )
        );

        const singleRiseVariables = this.createVariablesFromPlaceIds(
          t1.outgoingArcs.map((a: Arc) => a.destinationId),
          1
        );
        singleRiseVariables.push(
          ...this.createVariablesFromPlaceIds(
            t1.ingoingArcs.map((a: Arc) => a.sourceId),
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
    } */

    return result;
  }

  private constraint(vars: Array<Variable>, bnds: Bound): SubjectTo {
    return {
      name: `c${this.constraintCount++}`,
      vars,
      bnds,
    };
  }

  private equal(
    variables: Variable | Array<Variable>,
    value: number
  ): SubjectTo {
    return this.constraint(arraify(variables), {
      type: Constraint.FIXED_VARIABLE,
      ub: value,
      lb: value,
    });
  }

  private greaterEqualThan(
    variables: Variable | Array<Variable>,
    lowerBound: number
  ): SubjectTo {
    return this.constraint(arraify(variables), {
      type: Constraint.LOWER_BOUND,
      ub: 0,
      lb: lowerBound,
    });
  }

  private lessEqualThan(
    variables: Variable | Array<Variable>,
    upperBound: number
  ): SubjectTo {
    return this.constraint(arraify(variables), {
      type: Constraint.UPPER_BOUND,
      ub: upperBound,
      lb: 0,
    });
  }

  private sumEqualsZero(...variables: Array<Variable>): SubjectTo {
    return this.equal(variables, 0);
  }

  private createVariablesFromPlaceIds(
    placeIds: Array<string>,
    coefficient: number
  ): Array<Variable> {
    return placeIds.map((id) => ({ name: id, coef: coefficient }));
  }

  private applyConstraints(ilp: LP, constraints: Array<SubjectTo>) {
    if (ilp.subjectTo === undefined) {
      ilp.subjectTo = [];
    }
    ilp.subjectTo.push(...constraints);

    if (ilp.binaries === undefined) {
      ilp.binaries = [];
    }
    if (ilp.generals === undefined) {
      ilp.generals = [];
    }
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
}
