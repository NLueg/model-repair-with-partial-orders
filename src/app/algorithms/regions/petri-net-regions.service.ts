import { Injectable } from '@angular/core';
import { GLPK } from 'glpk.js';
import { combineLatest, from, map, Observable, of, switchMap, tap } from 'rxjs';

import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import {
  ParsableSolution,
  ParsableSolutionsPerType,
  PlaceSolution,
} from '../../services/repair/repair.model';
import { RepairService } from '../../services/repair/repair.service';
import { IlpSolver } from './ilp-solver/ilp-solver';
import { ProblemSolution, VariableType } from './ilp-solver/solver-classes';
import { AutoRepairForSinglePlace, parseSolution } from './parse-solutions.fn';

const createGlpk: Promise<() => Promise<GLPK>> = import('glpk.js').then(
  (glpk) => (glpk as any).default
);

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionsService {
  constructor(private repairService: RepairService) {}

  computeRegions(
    partialOrders: PartialOrder[],
    petriNet: PetriNet,
    invalidPlaces: { [key: string]: number }
  ): Observable<PlaceSolution[]> {
    return from(createGlpk.then((create) => create())).pipe(
      switchMap((glpk) => {
        const invalidPlaceList = Object.keys(invalidPlaces).flat();
        if (invalidPlaceList.length === 0) {
          return of([]);
        }

        const solver = new IlpSolver(glpk, partialOrders, petriNet);

        return combineLatest(
          invalidPlaceList.map((place) =>
            solver.computeSolutions(place).pipe(
              map((solutions) => {
                const existingPlace = petriNet.places.find(
                  (p) => p.id === place
                );

                const parsedSolutions = parseSolution(
                  this.handleSolutions(solutions, solver),
                  existingPlace
                );

                const newTokens = parsedSolutions.find(
                  (solution) => solution.type === 'marking'
                ) as AutoRepairForSinglePlace;
                const missingTokens =
                  existingPlace && newTokens?.newMarking
                    ? newTokens.newMarking - existingPlace.marking
                    : undefined;

                const placeSolution: PlaceSolution = {
                  place,
                  solutions: parsedSolutions,
                  missingTokens: missingTokens,
                  invalidTraceCount: invalidPlaces[place],
                };
                return placeSolution;
              })
            )
          )
        ).pipe(
          tap((solutions) => {
            console.log('Generated solutions', solutions);
            this.repairService.saveNewSolutions(
              solutions,
              partialOrders.length
            );
          })
        );
      })
    );
  }

  private handleSolutions(
    solutions: ProblemSolution[],
    solver: IlpSolver
  ): ParsableSolutionsPerType[] {
    return solutions.map((solution) => ({
      type: solution.type,
      solutionParts: solution.solutions.map((singleSolution) =>
        Object.entries(singleSolution)
          .filter(
            ([variable, value]) =>
              value != 0 && solver.getInverseVariableMapping(variable) !== null
          )
          .map(([variable, value]) => {
            const decoded = solver.getInverseVariableMapping(variable)!;

            let parsableSolution: ParsableSolution;
            switch (decoded.type) {
              case VariableType.INITIAL_MARKING:
                parsableSolution = {
                  type: 'increase-marking',
                  newMarking: value,
                };
                break;
              case VariableType.INCOMING_TRANSITION_WEIGHT:
                parsableSolution = {
                  type: 'incoming-arc',
                  incoming: decoded.label,
                  marking: value,
                };
                break;
              case VariableType.OUTGOING_TRANSITION_WEIGHT:
                parsableSolution = {
                  type: 'outgoing-arc',
                  outgoing: decoded.label,
                  marking: value,
                };
            }

            return parsableSolution;
          })
      ),
    }));
  }
}
