import { TestBed } from '@angular/core/testing';

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
    service
      .computeSolutions([parsedInvalidPartialOrder], parsedPetriNet, {
        p5: 1,
        p7: 1,
      })
      .subscribe((result) => {
        expect(result).toEqual([
          {
            invalidTraceCount: 1,
            missingTokens: 1,
            place: 'p5',
            solutions: [
              {
                incoming: [],
                newMarking: 2,
                outgoing: [
                  {
                    transitionLabel: 'a',
                    weight: 1,
                  },
                ],
                regionSize: 2,
                repairType: 'multiplePlaces',
                type: 'modify-place',
              },
              {
                newMarking: 2,
                regionSize: 5,
                repairType: 'changeIncoming',
                type: 'marking',
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
                places: [
                  {
                    incoming: [
                      {
                        transitionLabel: 'b',
                        weight: 1,
                      },
                    ],
                    newMarking: 1,
                    outgoing: [
                      {
                        transitionLabel: 'd',
                        weight: 1,
                      },
                    ],
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
                      {
                        transitionLabel: 'f',
                        weight: 1,
                      },
                    ],
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
                      {
                        transitionLabel: 'e',
                        weight: 1,
                      },
                      {
                        transitionLabel: 'f',
                        weight: 1,
                      },
                    ],
                  },
                ],
                regionSize: 3,
                repairType: 'multiplePlaces',
                type: 'replace-place',
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
                  {
                    transitionLabel: 'b',
                    weight: 1,
                  },
                ],
                newMarking: 1,
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
                regionSize: 8,
                repairType: 'changeIncoming',
                type: 'modify-place',
              },
              {
                newMarking: 2,
                regionSize: 10,
                repairType: 'changeMarking',
                type: 'marking',
              },
            ],
            type: 'error',
          },
        ]);
        done();
      });
  });
});
