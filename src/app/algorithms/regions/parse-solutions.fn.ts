import { Place } from '../../classes/diagram/place';
import {
  ParsableSolution,
  ParsableSolutionsPerType,
} from '../../services/repair/repair.model';
import { SolutionType } from './ilp-solver/solver-classes';

export type AutoRepairForSinglePlace =
  | {
      type: 'marking';
      newMarking: number;
    }
  | ModifyPlaceType;

type ModifyPlaceType = {
  type: 'modify-place';
} & SinglePlaceParameter;

export type AutoRepair = AutoRepairForSinglePlace | ReplacePlaceAutoRepair;

export type ReplacePlaceAutoRepair = {
  type: 'replace-place';
  repairType: SolutionType;
  places: SinglePlaceParameter[];
};

export type AutoRepairWithSolutionType = AutoRepair & {
  repairType: SolutionType;
};

export type SinglePlaceParameter = {
  newMarking?: number;
  incoming: ArcDefinition[];
  outgoing: ArcDefinition[];
};

type ArcDefinition = { transitionId: string; weight: number };

export function parseSolution(
  placeSolutionList: ParsableSolutionsPerType[],
  existingPlace: Place | undefined
): AutoRepairWithSolutionType[] {
  const returnList: (AutoRepairWithSolutionType | null)[] = placeSolutionList
    .map((parsableSolutionsPerType) => {
      const placeSolutions = parsableSolutionsPerType.solutionParts;
      if (placeSolutions.length === 0) {
        return null;
      }

      if (placeSolutions.length > 1) {
        return {
          type: 'replace-place',
          repairType: parsableSolutionsPerType.type,
          places: generateRepairForMultipleSolutions(placeSolutions),
        } as ReplacePlaceAutoRepair;
      }

      const singlePlaceSolution = getSinglePlaceSolution(placeSolutions[0]);

      if (!singlePlaceSolution || singlePlaceSolution.type === 'marking') {
        return {
          ...singlePlaceSolution,
          repairType: parsableSolutionsPerType.type,
        } as AutoRepairWithSolutionType;
      }

      if (singlePlaceSolution.newMarking) {
        return {
          ...checkPlaceAndReturnMarkingIfEquals(
            mergeAllDuplicatePlaces(singlePlaceSolution),
            existingPlace
          ),
          repairType: parsableSolutionsPerType.type,
        };
      }

      const newPlaces: SinglePlaceParameter[] = [];

      const incomingAllTheSame =
        singlePlaceSolution.incoming.length > 1
          ? singlePlaceSolution.incoming.every(
              (incoming) =>
                incoming.transitionId ===
                singlePlaceSolution.incoming[0].transitionId
            )
          : false;
      if (
        incomingAllTheSame &&
        singlePlaceSolution.outgoing.length >=
          singlePlaceSolution.incoming.length
      ) {
        const incoming = [...singlePlaceSolution.incoming];
        const outgoing = [...singlePlaceSolution.outgoing].reverse();

        for (let index = 0; index < incoming.length; index++) {
          const incomingArc = incoming[index];
          const outgoingArc = outgoing.pop()!;
          newPlaces.push({
            incoming: [incomingArc],
            outgoing: [outgoingArc],
          });
        }
        newPlaces[newPlaces.length - 1].outgoing.concat(outgoing);
      } else {
        const outgoingAllTheSame =
          singlePlaceSolution.outgoing.length > 1
            ? singlePlaceSolution.outgoing.every(
                (incoming) =>
                  incoming.transitionId ===
                  singlePlaceSolution.outgoing[0].transitionId
              )
            : false;

        if (
          outgoingAllTheSame &&
          singlePlaceSolution.incoming.length >=
            singlePlaceSolution.outgoing.length
        ) {
          const incoming = [...singlePlaceSolution.incoming].reverse();
          const outgoing = [...singlePlaceSolution.outgoing];

          for (let index = 0; index < outgoing.length; index++) {
            const outgoingElement = outgoing[index];
            const incomingElement = incoming.pop()!;
            newPlaces.push({
              outgoing: [outgoingElement],
              incoming: [incomingElement],
            });
          }
          newPlaces[newPlaces.length - 1].outgoing.concat(outgoing);
        } else {
          newPlaces.push({
            ...singlePlaceSolution,
          });
        }
      }

      if (newPlaces.length === 0) {
        return null;
      }

      if (newPlaces.length === 1) {
        const repair: AutoRepairForSinglePlace = {
          ...newPlaces[0],
          type: 'modify-place',
        };
        return {
          ...checkPlaceAndReturnMarkingIfEquals(
            mergeAllDuplicatePlaces(repair),
            existingPlace
          ),
          repairType: parsableSolutionsPerType.type,
        };
      }

      const repair: AutoRepairWithSolutionType = {
        type: 'replace-place',
        repairType: parsableSolutionsPerType.type,
        places: newPlaces.map((newPlace) => mergeAllDuplicatePlaces(newPlace)),
      };
      return repair;
    })
    .filter((solution) => !!solution);

  return returnList as AutoRepairWithSolutionType[];
}

function generateRepairForMultipleSolutions(
  placeSolutions: ParsableSolution[][]
): SinglePlaceParameter[] {
  const initialPlaces = placeSolutions.map((placeSolution) => {
    return {
      incoming: placeSolution
        .map((place) => {
          if (place.type === 'incoming-arc') {
            return {
              transitionId: place.incoming,
              weight: place.marking,
            };
          }
          return null;
        })
        .filter((arc) => arc !== null) as ArcDefinition[],
      outgoing: placeSolution
        .map((place) => {
          if (place.type === 'outgoing-arc') {
            return {
              transitionId: place.outgoing,
              weight: place.marking,
            };
          }
          return null;
        })
        .filter((arc) => arc !== null) as ArcDefinition[],
      newMarking: placeSolution.reduce(
        (acc: number | undefined, place: ParsableSolution) =>
          place.type === 'increase-marking'
            ? Math.max(acc ?? 0, place.newMarking)
            : acc,
        undefined
      ),
    };
  });

  // TODO: How to merge them together?

  return initialPlaces;
}

function checkPlaceAndReturnMarkingIfEquals(
  solution: AutoRepair,
  existingPlace: Place | undefined
): AutoRepair {
  if (
    solution.type === 'marking' ||
    solution.type === 'replace-place' ||
    !existingPlace ||
    (solution.type === 'modify-place' && !solution.newMarking)
  ) {
    return solution;
  }

  const incomingEquals = existingPlace.incomingArcs.every((arc) =>
    solution.incoming.some(
      (incoming) =>
        incoming.transitionId === arc.source && incoming.weight === arc.weight
    )
  );
  if (!incomingEquals) {
    return solution;
  }

  const outgoingEquals = existingPlace.outgoingArcs.every((arc) =>
    solution.outgoing.some(
      (incoming) =>
        incoming.transitionId === arc.target && incoming.weight === arc.weight
    )
  );
  if (!outgoingEquals) {
    return solution;
  }

  return {
    type: 'marking',
    newMarking: solution.newMarking!,
  };
}

function mergeAllDuplicatePlaces<T extends SinglePlaceParameter>(
  singlePlaceSolution: T
): T {
  singlePlaceSolution.incoming = reduceArcDefinition(
    singlePlaceSolution.incoming
  );
  singlePlaceSolution.outgoing = reduceArcDefinition(
    singlePlaceSolution.outgoing
  );
  return singlePlaceSolution;
}

function reduceArcDefinition(arcDefinition: ArcDefinition[]): ArcDefinition[] {
  return arcDefinition.reduce((acc: ArcDefinition[], arcDefinition) => {
    const foundArc = acc.find(
      (arc) => arc.transitionId === arcDefinition.transitionId
    );
    if (!foundArc) {
      acc.push(arcDefinition);
    } else {
      foundArc.weight += arcDefinition.weight;
    }
    return acc;
  }, []);
}

function getSinglePlaceSolution(
  placeSolutions: ParsableSolution[]
): AutoRepairForSinglePlace | null {
  return placeSolutions.reduce(
    (acc: AutoRepairForSinglePlace | null, solution) => {
      switch (solution.type) {
        case 'increase-marking':
          if (acc === null) {
            acc = {
              type: 'marking',
              newMarking: solution.newMarking,
            };
          } else {
            switch (acc.type) {
              case 'marking':
                throw Error("Can't have two increase-marking solutions");
              case 'modify-place':
                acc.newMarking = acc.newMarking
                  ? acc.newMarking + solution.newMarking
                  : solution.newMarking;
            }
          }
          break;
        case 'incoming-arc':
          if (acc === null) {
            acc = {
              type: 'modify-place',
              incoming: [
                { transitionId: solution.incoming, weight: solution.marking },
              ],
              outgoing: [],
            };
          } else {
            switch (acc.type) {
              case 'marking':
                acc = {
                  type: 'modify-place',
                  incoming: [
                    {
                      transitionId: solution.incoming,
                      weight: solution.marking,
                    },
                  ],
                  outgoing: [],
                  newMarking: acc.newMarking,
                };
                break;
              case 'modify-place':
                acc.incoming.push({
                  transitionId: solution.incoming,
                  weight: solution.marking,
                });
                break;
            }
          }
          break;
        case 'outgoing-arc':
          if (acc === null) {
            acc = {
              type: 'modify-place',
              incoming: [],
              outgoing: [
                { transitionId: solution.outgoing, weight: solution.marking },
              ],
            };
          } else {
            switch (acc.type) {
              case 'marking':
                acc = {
                  type: 'modify-place',
                  incoming: [],
                  outgoing: [
                    {
                      transitionId: solution.outgoing,
                      weight: solution.marking,
                    },
                  ],
                  newMarking: acc.newMarking,
                };
                break;
              case 'modify-place':
                acc.outgoing.push({
                  transitionId: solution.outgoing,
                  weight: solution.marking,
                });
                break;
            }
          }
          break;
      }
      return acc;
    },
    null
  );
}
