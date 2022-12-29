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
            place: 'p5',
            solutions: null,
          },
          {
            invalidTraceCount: 1,
            place: 'p7',
            solutions: {
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
                {
                  transitionId: 'f',
                  weight: 1,
                },
              ],
              type: 'modify-place',
            },
          },
        ]);
        done();
      });
  });
});
