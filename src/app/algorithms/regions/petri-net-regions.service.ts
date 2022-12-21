import { Injectable } from '@angular/core';
import { GLPK } from 'glpk.js';
import { from, map, Observable, switchMap } from 'rxjs';

import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import {
  IlpSolver,
  ProblemSolution,
  VariableType,
} from './ilp-solver/ilp-solver';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createGlpk: () => Promise<GLPK> = require('glpk.js').default;

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionsService {
  // TODO: Better name & return something
  computeRegions(
    partialOrders: PartialOrder[],
    petriNet: PetriNet,
    invalidPlaces: string[]
  ): Observable<void> {
    return from(createGlpk()).pipe(
      switchMap((glpk) => {
        const solver = new IlpSolver(glpk);
        return solver
          .computeRegions(partialOrders, petriNet, invalidPlaces)
          .pipe(map((solutions) => this.handleSolutions(solutions, solver)));
      })
    );
  }

  // TODO: Handle solutions!
  private handleSolutions(solutions: ProblemSolution[], solver: IlpSolver) {
    console.warn(solutions);

    for (const placeSolution of solutions) {
      console.warn('====== PLACE START ======');
      Object.entries(placeSolution.solution.result.vars).forEach(
        ([variable, value]) => {
          if (value === 0) {
            return;
          }
          const decoded = solver.getInverseVariableMapping(variable);
          if (decoded === null) {
            return;
          }

          switch (decoded.type) {
            case VariableType.INITIAL_MARKING:
              console.log('Marking for place ', value);
              return;
            case VariableType.INGOING_WEIGHT:
              console.log(`Add transition from place to ${decoded.label}`);
              return;
            case VariableType.OUTGOING_WEIGHT:
              console.log(`Add transition from ${decoded.label} to place`);
              return;
          }
        }
      );
      console.warn('====== PLACE END ======');
    }
  }
}
