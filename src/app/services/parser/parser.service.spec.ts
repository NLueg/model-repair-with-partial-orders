import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { examplePetriNet } from '../upload/example-file';
import { parsedPetriNet } from '../upload/example-file-parsed';
import { parsedSimpleExamplePetriNet } from '../upload/simple-example/simple-example-parsed';
import {
  simpleExampleLog,
  simpleExamplePetriNet,
  simpleExamplePo,
} from '../upload/simple-example/simple-example-texts';
import { ParserService } from './parser.service';

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ToastrService,
          useValue: { toasts: [], warning: jest.fn() },
        },
      ],
    });
    service = TestBed.inject(ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parseNet should parse example petri net', () => {
    const errors = new Set<string>();
    const result = service.parsePetriNet(examplePetriNet, errors);

    expect(result).toEqual(parsedPetriNet);
  });

  it('parseNet should parse simple example petri net', () => {
    const errors = new Set<string>();
    const result = service.parsePetriNet(simpleExamplePetriNet, errors);

    expect(result).toEqual(parsedSimpleExamplePetriNet);
  });

  it('parseLog should parse simple invalid log', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrders(simpleExampleLog, errors);
    expect(result).toEqual([
      {
        arcs: [
          {
            breakpoints: [],
            source: 'e1',
            target: 'e3',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e3',
            target: 'e2',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e2',
            target: 'e4',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'e1',
            incomingArcs: [],
            label: 'a',
            nextEvents: ['e3'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'e3',
            incomingArcs: [],
            label: 'c',
            nextEvents: ['e2'],
            outgoingArcs: [],
            previousEvents: ['e1'],
            type: 'event',
          },
          {
            id: 'e2',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['e4'],
            outgoingArcs: [],
            previousEvents: ['e3'],
            type: 'event',
          },
          {
            id: 'e4',
            incomingArcs: [],
            label: 'd',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['e2'],
            type: 'event',
          },
        ],
        finalEvents: ['e4'],
        initialEvents: ['e1'],
      },
      {
        arcs: [
          {
            breakpoints: [],
            source: 'e1',
            target: 'e2',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e2',
            target: 'e3',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e3',
            target: 'e4',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'e1',
            incomingArcs: [],
            label: 'a',
            nextEvents: ['e2'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'e2',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['e3'],
            outgoingArcs: [],
            previousEvents: ['e1'],
            type: 'event',
          },
          {
            id: 'e3',
            incomingArcs: [],
            label: 'c',
            nextEvents: ['e4'],
            outgoingArcs: [],
            previousEvents: ['e2'],
            type: 'event',
          },
          {
            id: 'e4',
            incomingArcs: [],
            label: 'd',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['e3'],
            type: 'event',
          },
        ],
        finalEvents: ['e4'],
        initialEvents: ['e1'],
      },
    ]);
  });

  it('parseLog should parse simple partial order', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrders(simpleExamplePo, errors);
    expect(result).toEqual([
      {
        arcs: [
          {
            breakpoints: [],
            source: 'e1',
            target: 'e2',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e1',
            target: 'e3',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e2',
            target: 'e4',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e3',
            target: 'e4',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'e1',
            incomingArcs: [],
            label: 'a',
            nextEvents: ['e2', 'e3'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'e2',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['e4'],
            outgoingArcs: [],
            previousEvents: ['e1'],
            type: 'event',
          },
          {
            id: 'e3',
            incomingArcs: [],
            label: 'c',
            nextEvents: ['e4'],
            outgoingArcs: [],
            previousEvents: ['e1'],
            type: 'event',
          },
          {
            id: 'e4',
            incomingArcs: [],
            label: 'd',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['e2', 'e3'],
            type: 'event',
          },
        ],
        finalEvents: ['e4'],
        initialEvents: ['e1'],
      },
      {
        arcs: [
          {
            breakpoints: [],
            source: 'e5',
            target: 'e6',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e5',
            target: 'e7',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e6',
            target: 'e8',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e7',
            target: 'e8',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'e5',
            incomingArcs: [],
            label: 'x',
            nextEvents: ['e6', 'e7'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'e6',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['e8'],
            outgoingArcs: [],
            previousEvents: ['e5'],
            type: 'event',
          },
          {
            id: 'e7',
            incomingArcs: [],
            label: 'c',
            nextEvents: ['e8'],
            outgoingArcs: [],
            previousEvents: ['e5'],
            type: 'event',
          },
          {
            id: 'e8',
            incomingArcs: [],
            label: 'd',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['e6', 'e7'],
            type: 'event',
          },
        ],
        finalEvents: ['e8'],
        initialEvents: ['e5'],
      },
    ]);
  });
});
