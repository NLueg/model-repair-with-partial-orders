import { Injectable } from '@angular/core';
import { GLPK } from 'glpk.js';
import { combineLatest, from, map, Observable, of, switchMap, tap } from 'rxjs';

import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
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

        const idToTransitionLabelMap = petriNet.transitions.reduce(
          (acc, transition) => {
            if (!acc[transition.id]) {
              acc[transition.id] = transition.label;
            }
            return acc;
          },
          {} as { [key: string]: string }
        );

        const solver = new IlpSolver(
          glpk,
          partialOrders,
          petriNet,
          idToTransitionLabelMap
        );

        return combineLatest(
          invalidPlaceList.map((place) =>
            solver.computeSolutions(place, invalidPlaceList).pipe(
              map((solutions) => {
                const existingPlace = petriNet.places.find(
                  (p) => p.id === place
                );

                const parsedSolutions = parseSolution(
                  this.handleSolutions(solutions, solver),
                  existingPlace,
                  idToTransitionLabelMap
                );

                const newTokens = parsedSolutions.find(
                  (solution) => solution.type === 'marking'
                ) as AutoRepairForSinglePlace;
                const missingTokens =
                  existingPlace && newTokens?.newMarking
                    ? newTokens.newMarking - existingPlace.marking
                    : undefined;

                const placeSolution: PlaceSolution = {
                  type: 'error',
                  place,
                  solutions: parsedSolutions,
                  missingTokens: missingTokens ?? 0,
                  invalidTraceCount: invalidPlaces[place],
                };
                return placeSolution;
              })
            )
          )
        );
      }),
      tap((solutions) => {
        const unhandledPlaces = petriNet.places.filter(
          (place) => !solutions.find((solution) => solution.place === place.id)
        );
        for (const unhandledPlace of unhandledPlaces) {
          const markingDifference = generateMarkingDifference(unhandledPlace);
          if (
            markingDifference > 0 &&
            unhandledPlace.marking - markingDifference >= 0
          ) {
            const placeSolution: PlaceSolution = {
              type: 'warning',
              place: unhandledPlace.id,
              tooManyTokens: markingDifference,
              reduceTokensTo: unhandledPlace.marking - markingDifference,
            };
            solutions.push(placeSolution as any);
            console.log(placeSolution);
          }
        }

        console.log('Generated solutions', solutions);
        this.repairService.saveNewSolutions(solutions, partialOrders.length);
      })
    );
  }

  private handleSolutions(
    solutions: ProblemSolution[],
    solver: IlpSolver
  ): ParsableSolutionsPerType[] {
    const solutionsWithMaybeDuplicates = solutions
      .map((solution) => ({
        type: solution.type,
        solutionParts: solution.solutions
          .map((singleSolution) =>
            Object.entries(singleSolution)
              .filter(
                ([variable, value]) =>
                  value != 0 &&
                  solver.getInverseVariableMapping(variable) !== null
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
          )
          .filter((solution) => solution.length > 0),
      }))
      .filter((solution) => solution.solutionParts.length > 0);

    return solutionsWithMaybeDuplicates.filter((value, index) => {
      const stringifiedValue = JSON.stringify(value.solutionParts);
      return (
        index ===
        solutionsWithMaybeDuplicates.findIndex(
          (obj) => JSON.stringify(obj.solutionParts) === stringifiedValue
        )
      );
    });
  }
}

/**
 * Current marking - outgoing
 * We don't take ingoing marking into account as we don't know if everything fires.
 * So this might be valid.
 * @param place
 */
function generateMarkingDifference(place?: Place): number {
  if (!place) {
    return 0;
  }

  const outgoingMarking = place.outgoingArcs.reduce(
    (sum, arc) => sum + arc.weight,
    0
  );

  return place.marking - outgoingMarking;
}
