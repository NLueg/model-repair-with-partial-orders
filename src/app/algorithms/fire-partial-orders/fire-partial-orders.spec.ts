import {
  parsedInvalidPartialOrder,
  parsedPartialOrder,
  parsedPetriNet,
} from '../../services/upload/example-file-parsed';
import { FirePartialOrder } from './fire-partial-order';

describe('fire partial orders', () => {
  it('should fire partial orders', () => {
    const result = new FirePartialOrder(
      parsedPetriNet,
      parsedPartialOrder
    ).getInvalidPlaces();

    expect(result).toEqual([]);
  });

  it('should fire partial orders for invalid', () => {
    const result = new FirePartialOrder(
      parsedPetriNet,
      parsedInvalidPartialOrder
    ).getInvalidPlaces();

    expect(result).toEqual([
      {
        invalidArcs: [
          {
            breakpoints: [],
            source: 'p5',
            target: 'a',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'p5',
            weight: 1,
          },
        ],
        placeId: 'p5',
      },
      {
        invalidArcs: [
          {
            breakpoints: [],
            source: 'p7',
            target: 'd',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'p7',
            target: 'd',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'p7',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'd',
            target: 'p7',
            weight: 1,
          },
        ],
        placeId: 'p7',
      },
    ]);
  });
});
