import {
  parsedInvalidPartialorder,
  parsedPartialOrder,
  parsedPetriNet,
} from '../services/upload/example-file-parsed';
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
      parsedInvalidPartialorder
    ).getInvalidPlaces();

    expect(result).toEqual(['p5', 'p7']);
  });
});
