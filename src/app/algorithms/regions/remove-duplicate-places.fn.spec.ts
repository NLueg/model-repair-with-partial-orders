import { removeDuplicatePlaces } from './remove-duplicate-places.fn';

describe('remove-duplicate-place', () => {
  it('should return correct result', () => {
    const result = removeDuplicatePlaces([
      {
        type: 'sameIncoming',
        solutionParts: [
          [
            { type: 'incoming-arc', incoming: 'a', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'b', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'c', marking: 1 },
            { type: 'incoming-arc', incoming: 'x', marking: 1 },
            { type: 'increase-marking', newMarking: 1 },
          ],
        ],
      },
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
            { type: 'incoming-arc', incoming: 'a', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'b', marking: 1 },
            { type: 'incoming-arc', incoming: 'x', marking: 1 },
          ],
          [
            { type: 'incoming-arc', incoming: 'a', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'b', marking: 1 },
            { type: 'incoming-arc', incoming: 'x', marking: 1 },
          ],
          [
            { type: 'incoming-arc', incoming: 'a', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'c', marking: 1 },
            { type: 'incoming-arc', incoming: 'x', marking: 1 },
          ],
          [
            { type: 'incoming-arc', incoming: 'a', marking: 1 },
            { type: 'outgoing-arc', outgoing: 'c', marking: 1 },
            { type: 'incoming-arc', incoming: 'x', marking: 1 },
          ],
        ],
      },
    ]);

    expect(result).toEqual([
      {
        solutionParts: [
          [
            {
              incoming: 'a',
              marking: 1,
              type: 'incoming-arc',
            },
            {
              marking: 1,
              outgoing: 'b',
              type: 'outgoing-arc',
            },
            {
              marking: 1,
              outgoing: 'c',
              type: 'outgoing-arc',
            },
            {
              incoming: 'x',
              marking: 1,
              type: 'incoming-arc',
            },
            {
              newMarking: 1,
              type: 'increase-marking',
            },
          ],
        ],
        type: 'sameIncoming',
      },
      {
        solutionParts: [
          [
            {
              incoming: 'a',
              marking: 1,
              type: 'incoming-arc',
            },
            {
              marking: 1,
              outgoing: 'b',
              type: 'outgoing-arc',
            },
            {
              incoming: 'x',
              marking: 1,
              type: 'incoming-arc',
            },
          ],
          [
            {
              incoming: 'a',
              marking: 1,
              type: 'incoming-arc',
            },
            {
              marking: 1,
              outgoing: 'c',
              type: 'outgoing-arc',
            },
            {
              incoming: 'x',
              marking: 1,
              type: 'incoming-arc',
            },
          ],
        ],
        type: 'multiplePlaces',
      },
    ]);
  });
});
