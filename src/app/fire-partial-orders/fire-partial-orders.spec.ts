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
    ).firePartialOrder();

    expect(result).toEqual([
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'backwards',
        valid: true,
      },
      {
        phase: 'backwards',
        valid: true,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'flow',
        valid: true,
      },
    ]);
  });

  it('should fire partial orders for invalid', () => {
    const result = new FirePartialOrder(
      parsedPetriNet,
      parsedInvalidPartialorder
    ).firePartialOrder();

    expect(result).toEqual([
      {
        phase: 'backwards',
        valid: true,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'backwards',
        valid: true,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'flow',
        valid: false,
      },
      {
        phase: 'forwards',
        valid: true,
      },
      {
        phase: 'flow',
        valid: false,
      },
    ]);
  });
});
