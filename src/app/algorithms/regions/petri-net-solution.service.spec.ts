import { TestBed } from '@angular/core/testing';

import { Arc } from '../../classes/diagram/arc';
import { RepairService } from '../../services/repair/repair.service';
import {
  parsedInvalidPartialOrder,
  parsedPetriNet,
} from '../../services/upload/example-file-parsed';
import { PetriNetSolutionService } from './petri-net-solution.service';

describe('PetriNetSolutionService', () => {
  let service: PetriNetSolutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RepairService, useValue: { saveNewSolutions: jest.fn() } },
      ],
    });
    service = TestBed.inject(PetriNetSolutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate solutions', (done) => {
    const arc: Arc[] = [];

    service
      .computeSolutions([parsedInvalidPartialOrder], parsedPetriNet, {
        p5: { count: 1, blockedArcs: arc },
        p7: { count: 1, blockedArcs: arc },
      })
      .subscribe((result) => {
        expect(result).toEqual([
          {
            invalidTraceCount: 1,
            missingTokens: 1,
            place: 'p5',
            solutions: [
              {
                newMarking: 2,
                repairType: 'sameIncoming',
                type: 'marking',
              },
              {
                incoming: [],
                newMarking: 2,
                outgoing: [
                  {
                    transitionLabel: 'a',
                    weight: 1,
                  },
                ],
                repairType: 'sameOutgoing',
                type: 'modify-place',
              },
            ],
            type: 'error',
          },
          {
            invalidTraceCount: 1,
            missingTokens: 1,
            place: 'p7',
            solutions: [
              {
                newMarking: 2,
                repairType: 'arcsSame',
                type: 'marking',
              },
              {
                incoming: [
                  {
                    transitionLabel: 'd',
                    weight: 1,
                  },
                  {
                    transitionLabel: 'c',
                    weight: 1,
                  },
                ],
                outgoing: [
                  {
                    transitionLabel: 'c',
                    weight: 1,
                  },
                ],
                repairType: 'sameIncoming',
                type: 'modify-place',
              },
              {
                incoming: [
                  {
                    transitionLabel: 'd',
                    weight: 1,
                  },
                ],
                newMarking: 2,
                outgoing: [
                  {
                    transitionLabel: 'd',
                    weight: 1,
                  },
                  {
                    transitionLabel: 'c',
                    weight: 1,
                  },
                ],
                repairType: 'sameOutgoing',
                type: 'modify-place',
              },
              {
                incoming: [
                  {
                    transitionLabel: 'd',
                    weight: 1,
                  },
                ],
                outgoing: [
                  {
                    transitionLabel: 'c',
                    weight: 1,
                  },
                ],
                repairType: 'unbounded',
                type: 'modify-place',
              },
            ],
            type: 'error',
          },
          {
            place: 'p1',
            reduceTokensTo: 1,
            tooManyTokens: 1,
            type: 'warning',
          },
        ]);
        done();
      });
  });
});
