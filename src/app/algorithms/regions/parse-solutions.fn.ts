import { Place } from '../../classes/diagram/place';
import { ParsableSolution } from '../../services/repair/repair.model';

export type AutoRepairForSinglePlace =
  | {
      type: 'marking';
      newMarking: number;
    }
  | ModifyPlaceType;

type ModifyPlaceType = {
  type: 'modify-place';
} & SinglePlaceParameter;

export type AutoRepair =
  | AutoRepairForSinglePlace
  | {
      type: 'replace-place';
      places: SinglePlaceParameter[];
    };

export type SinglePlaceParameter = {
  newMarking?: number;
  incoming: ArcDefinition[];
  outgoing: ArcDefinition[];
};

type ArcDefinition = { transitionId: string; weight: number };

export function parseSolution(
  placeSolutions: ParsableSolution[],
  existingPlace: Place | undefined
): AutoRepair | null {
  const singlePlaceSolution = getSinglePlaceSolution(placeSolutions);

  if (!singlePlaceSolution || singlePlaceSolution.type === 'marking') {
    return singlePlaceSolution;
  }

  if (singlePlaceSolution.newMarking) {
    console.warn(
      'Unable to split the place into multiple places, because it has a defined marking.'
    );
    return checkPlaceAndReturnMarkingIfEquals(
      mergeAllDuplicatePlaces(singlePlaceSolution),
      existingPlace
    );
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
    singlePlaceSolution.outgoing.length >= singlePlaceSolution.incoming.length
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
      singlePlaceSolution.incoming.length >= singlePlaceSolution.outgoing.length
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
      type: 'modify-place',
      ...newPlaces[0],
    };
    return checkPlaceAndReturnMarkingIfEquals(
      mergeAllDuplicatePlaces(repair),
      existingPlace
    );
  }

  return {
    type: 'replace-place',
    places: newPlaces.map((newPlace) => mergeAllDuplicatePlaces(newPlace)),
  };
}

function checkPlaceAndReturnMarkingIfEquals(
  solution: AutoRepair,
  existingPlace: Place | undefined
): AutoRepair {
  if (
    solution.type === 'marking' ||
    solution.type === 'replace-place' ||
    !existingPlace
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
    newMarking: existingPlace.marking,
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
