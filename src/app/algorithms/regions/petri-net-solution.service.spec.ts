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

  xit('should generate solutions', (done) => {
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
            missingTokens: 0,
            place: 'p5',
            solutions: [],
            type: 'error',
          },
          {
            invalidTraceCount: 1,
            missingTokens: 0,
            place: 'p7',
            solutions: [
              {
                newMarking: 1,
                repairType: 'arcsSame',
                type: 'marking',
              },
              {
                incoming: [
                  {
                    transitionId: 'd',
                    weight: 1,
                  },
                  {
                    transitionId: 'c',
                    weight: 1,
                  },
                ],
                outgoing: [],
                repairType: 'sameIncoming',
                type: 'modify-place',
              },
              {
                incoming: [
                  {
                    transitionId: 'a',
                    weight: 1,
                  },
                ],
                newMarking: 1,
                outgoing: [
                  {
                    transitionId: 'd',
                    weight: 1,
                  },
                  {
                    transitionId: 'c',
                    weight: 1,
                  },
                ],
                repairType: 'sameOutgoing',
                type: 'modify-place',
              },
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
          {
            place: 'p3',
            reduceTokensTo: 0,
            tooManyTokens: 1,
            type: 'warning',
          },
        ]);
        done();
      });
  });
});
