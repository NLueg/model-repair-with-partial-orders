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
            source: 'a',
            target: 'a_',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'a_',
            target: 'b',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b',
            target: 'c',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'd',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'd',
            target: 'e',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e',
            target: 'f',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'a',
            incomingArcs: [],
            label: 'Reise_planen',
            nextEvents: ['a_'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'a_',
            incomingArcs: [],
            label: 'Optionen_prüfen',
            nextEvents: ['b'],
            outgoingArcs: [],
            previousEvents: ['a'],
            type: 'event',
          },
          {
            id: 'b',
            incomingArcs: [],
            label: 'Flug_suchen',
            nextEvents: ['c'],
            outgoingArcs: [],
            previousEvents: ['a_'],
            type: 'event',
          },
          {
            id: 'c',
            incomingArcs: [],
            label: 'Flug_buchen',
            nextEvents: ['d'],
            outgoingArcs: [],
            previousEvents: ['b'],
            type: 'event',
          },
          {
            id: 'd',
            incomingArcs: [],
            label: 'Hotel_suchen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['c'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Hotel_buchen',
            nextEvents: ['f'],
            outgoingArcs: [],
            previousEvents: ['d'],
            type: 'event',
          },
          {
            id: 'f',
            incomingArcs: [],
            label: 'Unterlagen_drucken',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['e'],
            type: 'event',
          },
        ],
        finalEvents: ['f'],
        initialEvents: ['a'],
      },
      {
        arcs: [
          {
            breakpoints: [],
            source: 'a',
            target: 'a_',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'a_',
            target: 'b',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b',
            target: 'c',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'd',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'd',
            target: 'e',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'a',
            incomingArcs: [],
            label: 'Reise_planen',
            nextEvents: ['a_'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'a_',
            incomingArcs: [],
            label: 'Optionen_prüfen',
            nextEvents: ['b'],
            outgoingArcs: [],
            previousEvents: ['a'],
            type: 'event',
          },
          {
            id: 'b',
            incomingArcs: [],
            label: 'Flug_buchen',
            nextEvents: ['c'],
            outgoingArcs: [],
            previousEvents: ['a_'],
            type: 'event',
          },
          {
            id: 'c',
            incomingArcs: [],
            label: 'Hotel_suchen',
            nextEvents: ['d'],
            outgoingArcs: [],
            previousEvents: ['b'],
            type: 'event',
          },
          {
            id: 'd',
            incomingArcs: [],
            label: 'Hotel_buchen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['c'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Unterlagen_drucken',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['d'],
            type: 'event',
          },
        ],
        finalEvents: ['e'],
        initialEvents: ['a'],
      },
      {
        arcs: [
          {
            breakpoints: [],
            source: 'a',
            target: 'a_',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'a_',
            target: 'b',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'b',
            target: 'c',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'c',
            target: 'd',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'd',
            target: 'e',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'e',
            target: 'f',
            weight: 1,
          },
          {
            breakpoints: [],
            source: 'f',
            target: 'g',
            weight: 1,
          },
        ],
        events: [
          {
            id: 'a',
            incomingArcs: [],
            label: 'Reise_planen',
            nextEvents: ['a_'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'a_',
            incomingArcs: [],
            label: 'Optionen_prüfen',
            nextEvents: ['b'],
            outgoingArcs: [],
            previousEvents: ['a'],
            type: 'event',
          },
          {
            id: 'b',
            incomingArcs: [],
            label: 'Flug_suchen',
            nextEvents: ['c'],
            outgoingArcs: [],
            previousEvents: ['a_'],
            type: 'event',
          },
          {
            id: 'c',
            incomingArcs: [],
            label: 'Flug_buchen',
            nextEvents: ['d'],
            outgoingArcs: [],
            previousEvents: ['b'],
            type: 'event',
          },
          {
            id: 'd',
            incomingArcs: [],
            label: 'Hotel_suchen',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['c'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Frühstück_buchen',
            nextEvents: ['f'],
            outgoingArcs: [],
            previousEvents: ['d'],
            type: 'event',
          },
          {
            id: 'f',
            incomingArcs: [],
            label: 'Hotel_buchen',
            nextEvents: ['g'],
            outgoingArcs: [],
            previousEvents: ['e'],
            type: 'event',
          },
          {
            id: 'g',
            incomingArcs: [],
            label: 'Unterlagen_drucken',
            nextEvents: [],
            outgoingArcs: [],
            previousEvents: ['f'],
            type: 'event',
          },
        ],
        finalEvents: ['g'],
        initialEvents: ['a'],
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
        '1 Grind_Beans km []\n' +
        '1 Unlock_coffee_machine ke []\n' +
        '1 Get_water_with_glass_pot wgh []\n' +
        '1 Empty_strainer fl [ke]\n' +
        '1 Fill_strainer ff [km, fl]\n' +
        '1 Fill_kettle we [wgh, ke]\n' +
        '1 Clean_coffee_pot ka [ke]\n' +
        '1 Assemble_and_turn_on e [ka, we, ff]\n' +
        '2 Grind_Beans km []\n' +
        '2 Unlock_coffee_machine ke []\n' +
        '2 Empty_strainer fl [ke]\n' +
        '2 Fill_strainer ff [km, fl]\n' +
        '2 Clean_coffee_pot ka [ke]\n' +
        '2 Get_water_with_coffee_pot wkh [ka]\n' +
        '2 Fill_kettle we [wkh]\n' +
        '2 Assemble_and_turn_on e [we, ff]',
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
            label: 'Grind_Beans',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'ke',
            incomingArcs: [],
            label: 'Unlock_coffee_machine',
            nextEvents: ['fl', 'we', 'ka'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'wgh',
            incomingArcs: [],
            label: 'Get_water_with_glass_pot',
            nextEvents: ['we'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'fl',
            incomingArcs: [],
            label: 'Empty_strainer',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'ff',
            incomingArcs: [],
            label: 'Fill_strainer',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['km', 'fl'],
            type: 'event',
          },
          {
            id: 'we',
            incomingArcs: [],
            label: 'Fill_kettle',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['wgh', 'ke'],
            type: 'event',
          },
          {
            id: 'ka',
            incomingArcs: [],
            label: 'Clean_coffee_pot',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Assemble_and_turn_on',
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
            label: 'Grind_Beans',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'ke',
            incomingArcs: [],
            label: 'Unlock_coffee_machine',
            nextEvents: ['fl', 'ka'],
            outgoingArcs: [],
            previousEvents: [],
            type: 'event',
          },
          {
            id: 'fl',
            incomingArcs: [],
            label: 'Empty_strainer',
            nextEvents: ['ff'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'ff',
            incomingArcs: [],
            label: 'Fill_strainer',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['km', 'fl'],
            type: 'event',
          },
          {
            id: 'ka',
            incomingArcs: [],
            label: 'Clean_coffee_pot',
            nextEvents: ['wkh'],
            outgoingArcs: [],
            previousEvents: ['ke'],
            type: 'event',
          },
          {
            id: 'wkh',
            incomingArcs: [],
            label: 'Get_water_with_coffee_pot',
            nextEvents: ['we'],
            outgoingArcs: [],
            previousEvents: ['ka'],
            type: 'event',
          },
          {
            id: 'we',
            incomingArcs: [],
            label: 'Fill_kettle',
            nextEvents: ['e'],
            outgoingArcs: [],
            previousEvents: ['wkh'],
            type: 'event',
          },
          {
            id: 'e',
            incomingArcs: [],
            label: 'Assemble_and_turn_on',
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
