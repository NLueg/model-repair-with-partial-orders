import {
  parsedPartialOrder,
  parsedPetriNet,
} from '../upload/example-file-parsed';
import { firePartialOrder } from './fire-partial-orders.fn';

describe('firePartialOrders', () => {
  it('should do something', () => {
    const result = firePartialOrder(parsedPetriNet, parsedPartialOrder);
    expect(result).toEqual([]);
  });
});
