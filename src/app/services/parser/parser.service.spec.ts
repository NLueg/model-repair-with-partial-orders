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

  it('parseLog should parse complex partial order', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrders(
      '.type log\n' +
        '.attributes\n' +
        'case-id\n' +
        'concept:name\n' +
        'event-id\n' +
        'follows[]\n' +
        '.events\n' +
        '1 Kaffeebohnen_mahlen km []\n' +
        '1 Kaffeemaschine_entriegeln ke []\n' +
        '1 Wasser_mit_Glaskanne_holen wgh []\n' +
        '1 Filter_leeren fl [ke]\n' +
        '1 Filter_füllen ff [km, fl]\n' +
        '1 Wasser_einfüllen we [wgh, ke]\n' +
        '1 Kaffeekanne_auswaschen ka [ke]\n' +
        '1 Zusammensetzen_und_starten e [ka, we, ff]\n' +
        '2 Kaffeebohnen_mahlen km []\n' +
        '2 Kaffeemaschine_entriegeln ke []\n' +
        '2 Filter_leeren fl [ke]\n' +
        '2 Filter_füllen ff [km, fl]\n' +
        '2 Kaffeekanne_auswaschen ka [ke]\n' +
        '2 Wasser_mit_Kaffeekanne_holen wkh [ka]\n' +
        '2 Wasser_einfüllen we [wkh]\n' +
        '2 Zusammensetzen_und_starten e [we, ff]',
      errors
    );
    expect(result).toEqual([
      {
        arcs: [
          {
            breakpoints: [],
            source: 'ke',
            target: 'fl',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'km',
            target: 'ff',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'fl',
            target: 'ff',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'wgh',
            target: 'we',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ke',
            target: 'we',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ke',
            target: 'ka',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ka',
            target: 'e',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'we',
            target: 'e',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ff',
            target: 'e',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'km',
            incomingArcs: [],
            label: 'Kaffeebohnen_mahlen',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'ke',
            incomingArcs: [],
            label: 'Kaffeemaschine_entriegeln',
            nextEvents: ['fl', 'we', 'ka'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'wgh',
            incomingArcs: [],
            label: 'Wasser_mit_Glaskanne_holen',
            nextEvents: ['we'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'fl',
            incomingArcs: [],
            label: 'Filter_leeren',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'ff',
            incomingArcs: [],
            label: 'Filter_füllen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['km', 'fl'],
            type: 'event',
          },
          {
            id: 'we',
            incomingArcs: [],
            label: 'Wasser_einfüllen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['wgh', 'ke'],
            type: 'event',
          },
          {
            id: 'ka',
            incomingArcs: [],
            label: 'Kaffeekanne_auswaschen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Zusammensetzen_und_starten',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['ka', 'we', 'ff'],
            type: 'event',
          },
        ],
        finalEvents: ['e'],
        initialEvents: ['km', 'ke', 'wgh'],
      },
      {
        arcs: [
          {
            breakpoints: [],
            source: 'ke',
            target: 'fl',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'km',
            target: 'ff',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'fl',
            target: 'ff',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ke',
            target: 'ka',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ka',
            target: 'wkh',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'wkh',
            target: 'we',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'we',
            target: 'e',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'ff',
            target: 'e',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'km',
            incomingArcs: [],
            label: 'Kaffeebohnen_mahlen',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'ke',
            incomingArcs: [],
            label: 'Kaffeemaschine_entriegeln',
            nextEvents: ['fl', 'ka'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'fl',
            incomingArcs: [],
            label: 'Filter_leeren',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'ff',
            incomingArcs: [],
            label: 'Filter_füllen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['km', 'fl'],
            type: 'event',
          },
          {
            id: 'ka',
            incomingArcs: [],
            label: 'Kaffeekanne_auswaschen',
            nextEvents: ['wkh'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'wkh',
            incomingArcs: [],
            label: 'Wasser_mit_Kaffeekanne_holen',
            nextEvents: ['we'],
            outgoingArcs: [],
            previousEvents: ['ka'],
            type: 'event',
          },
          {
            id: 'we',
            incomingArcs: [],
            label: 'Wasser_einfüllen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['wkh'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Zusammensetzen_und_starten',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['we', 'ff'],
            type: 'event',
          },
        ],
        finalEvents: ['e'],
        initialEvents: ['km', 'ke'],
      },
    ]);
  });

  it('parseLog should parse partial-order without ids', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrders(
      '.type log\n' +
        '.attributes\n' +
        'case-id\n' +
        'concept:name\n' +
        '.events\n' +
        '1 a\n' +
        '1 b\n' +
        '1 b\n' +
        '1 b\n' +
        '1 c\n' +
        '1 d',
      errors
    );
    expect(result).toEqual([
      {
        arcs: [
          {
            breakpoints: [],
            source: 'a',
            target: 'b',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b',
            target: 'b1',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b1',
            target: 'b2',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b2',
            target: 'c',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'd',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'a',
            incomingArcs: [],
            label: 'a',
            nextEvents: ['b'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'b',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['b1'],
            outgoingArcs: [],
            previousEvents: ['a'],
            type: 'event',
          },
          {
            id: 'b1',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['b2'],
            outgoingArcs: [],
            previousEvents: ['b'],
            type: 'event',
          },
          {
            id: 'b2',
            incomingArcs: [],
            label: 'b',
            nextEvents: ['c'],
            outgoingArcs: [],
            previousEvents: ['b1'],
            type: 'event',
          },
          {
            id: 'c',
            incomingArcs: [],
            label: 'c',
            nextEvents: ['d'],
            outgoingArcs: [],
            previousEvents: ['b2'],
            type: 'event',
          },
          {
            id: 'd',
            incomingArcs: [],
            label: 'd',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['c'],
            type: 'event',
          },
        ],
        finalEvents: ['d'],
        initialEvents: ['a'],
      },
    ]);
  });
});
