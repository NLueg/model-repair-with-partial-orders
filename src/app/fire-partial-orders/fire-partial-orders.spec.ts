import {
  exampleLog,
  exampleLogInvalid,
  examplePetriNet,
} from '../services/upload/example-file';
import { LpoFireValidator } from '../algorithms/algorithms/petri-net/fire-petri-net/lpo-fire-validator';
import {
  PartialOrderParserService,
  PetriNetParserService,
} from '../algorithms/models/public-api';

describe('fire partial orders', () => {
  const petriNetParserService = new PetriNetParserService();
  const partialOrderParserService = new PartialOrderParserService();

  it('should fire partial orders', () => {
    const petriNet = petriNetParserService.parse(examplePetriNet);
    const partialOrder = partialOrderParserService.parse(exampleLog);

    const fireValidator = new LpoFireValidator(petriNet!, partialOrder!);
    const result = fireValidator.validate();

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
    const petriNet = petriNetParserService.parse(examplePetriNet);
    const partialOrder = partialOrderParserService.parse(exampleLogInvalid);

    const fireValidator = new LpoFireValidator(petriNet!, partialOrder!);
    const result = fireValidator.validate();

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
