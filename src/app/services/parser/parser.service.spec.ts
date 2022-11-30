import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { exampleContent1 } from '../upload/example-file';
import { ParserService } from './parser.service';

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: { toasts: [] } }],
    });
    service = TestBed.inject(ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse example content', () => {
    const errors = new Set<string>();
    const result = service.parse(exampleContent1, errors);

    expect(result).toEqual({
      arcs: [
        {
          breakpoints: [],
          source: '1',
          target: '2',
        },
        {
          breakpoints: [],
          source: '2',
          target: '3',
        },
        {
          breakpoints: [],
          source: '2',
          target: '5',
        },
        {
          breakpoints: [],
          source: '3',
          target: '4',
        },
        {
          breakpoints: [],
          source: '4',
          target: '7',
        },
        {
          breakpoints: [],
          source: '5',
          target: '6',
        },
        {
          breakpoints: [],
          source: '6',
          target: '7',
        },
      ],
      elements: [
        {
          id: '1',
          incomingArcs: [],
          label: 'Reise planen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '1',
              target: '2',
            },
          ],
        },
        {
          id: '2',
          incomingArcs: [
            {
              breakpoints: [],
              source: '1',
              target: '2',
            },
          ],
          label: 'Prüfen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '2',
              target: '3',
            },
            {
              breakpoints: [],
              source: '2',
              target: '5',
            },
          ],
        },
        {
          id: '3',
          incomingArcs: [
            {
              breakpoints: [],
              source: '2',
              target: '3',
            },
          ],
          label: 'Flug suchen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '3',
              target: '4',
            },
          ],
        },
        {
          id: '4',
          incomingArcs: [
            {
              breakpoints: [],
              source: '3',
              target: '4',
            },
          ],
          label: 'Flug buchen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '4',
              target: '7',
            },
          ],
        },
        {
          id: '5',
          incomingArcs: [
            {
              breakpoints: [],
              source: '2',
              target: '5',
            },
          ],
          label: 'Hotel suchen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '5',
              target: '6',
            },
          ],
        },
        {
          id: '6',
          incomingArcs: [
            {
              breakpoints: [],
              source: '5',
              target: '6',
            },
          ],
          label: 'Hotel buchen',
          outgoingArcs: [
            {
              breakpoints: [],
              source: '6',
              target: '7',
            },
          ],
        },
        {
          id: '7',
          incomingArcs: [
            {
              breakpoints: [],
              source: '4',
              target: '7',
            },
            {
              breakpoints: [],
              source: '6',
              target: '7',
            },
          ],
          label: 'Unterlagen speichern',
          outgoingArcs: [],
        },
      ],
      offset: {
        x: 0,
        y: 0,
      },
      text: '.type run\n.events\n1 | Reise planen\n2 | Prüfen\n3 | Flug suchen\n4 | Flug buchen\n5 | Hotel suchen\n6 | Hotel buchen\n7 | Unterlagen speichern\n.arcs\n1 2\n2 3\n2 5\n3 4\n4 7\n5 6\n6 7\n',
      warnings: [],
    });
  });
});
