import { TestBed } from '@angular/core/testing';

import { RepairService } from '../../services/repair/repair.service';
import {
  parsedInvalidPartialOrder,
  parsedPetriNet,
} from '../../services/upload/example-file-parsed';
import { PetriNetRegionsService } from './petri-net-regions.service';

describe('PetriNetRegionsService', () => {
  let service: PetriNetRegionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RepairService, useValue: { saveNewSolutions: jest.fn() } },
      ],
    });
    service = TestBed.inject(PetriNetRegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate solutions', (done) => {
    service
      .computeRegions([parsedInvalidPartialOrder], parsedPetriNet, {
        p5: 1,
        p7: 1,
      })
      .subscribe((result) => {
        expect(result).toEqual([
          {
            invalidTraceCount: 1,
            missingTokens: undefined,
            place: 'p5',
            solutions: [],
          },
          {
            invalidTraceCount: 1,
            missingTokens: undefined,
            place: 'p7',
            solutions: [
              {
                incoming: [
                  {
                    transitionId: 'd',
                    weight: 1,
                  },
                ],
                outgoing: [
                  {
                    transitionId: 'c',
                    weight: 1,
                  },
                ],
                repairType: 'arcsSame',
                type: 'modify-place',
              },
            ],
          },
        ]);
        done();
      });
  });
});
