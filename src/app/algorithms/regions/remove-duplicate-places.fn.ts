import {
  IncomingArcSolution,
  ParsableSolutionsPerType,
} from '../../services/repair/repair.model';

export function removeDuplicatePlaces(
  list: ParsableSolutionsPerType[]
): ParsableSolutionsPerType[] {
  return list.filter((solution) => {
    if (solution.solutionParts.length === 0) {
      return false;
    }
    console.error('Solution', JSON.parse(JSON.stringify(solution)));

    const removedIndices: number[] = [];
    solution.solutionParts = solution.solutionParts.filter(
      (outerPart, outerIndex) => {
        const outerOutgoingArcs = outerPart
          .filter((item) => item.type === 'outgoing-arc')
          .sort();
        const outerIncomingArcs = outerPart
          .filter((item) => item.type === 'incoming-arc')
          .sort() as IncomingArcSolution[];

        const foundIndex = solution.solutionParts.findIndex((part, index) => {
          if (outerIndex === index) {
            return false;
          }

          const outgoingArcs = JSON.stringify(
            part.filter((item) => item.type === 'outgoing-arc').sort()
          );
          if (JSON.stringify(outerOutgoingArcs) !== outgoingArcs) {
            return false;
          }

          const incomingArcs = part
            .filter((item) => item.type === 'incoming-arc')
            .sort() as IncomingArcSolution[];
          return outerIncomingArcs.every((incoming) =>
            incomingArcs.some(
              (arc) =>
                arc.incoming === incoming.incoming &&
                arc.marking === incoming.marking
            )
          );
        });

        const itemShouldBeRemoved =
          foundIndex !== -1 && !removedIndices.includes(foundIndex);
        if (itemShouldBeRemoved) {
          removedIndices.push(outerIndex);
        }
        return !itemShouldBeRemoved;
      }
    );
    return true;
  });
}
