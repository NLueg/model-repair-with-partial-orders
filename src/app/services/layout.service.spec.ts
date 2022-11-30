import { TestBed } from '@angular/core/testing';

import { Run } from '../classes/diagram/run';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should layout example content correctly', () => {
    const { run } = service.layout(exampleInput);
    expect(run).toEqual({
      arcs: [
        {
          breakpoints: [],
          source: 't1',
          target: 't2',
        },
        {
          breakpoints: [],
          source: 't2',
          target: 't4',
        },
        {
          breakpoints: [],
          source: 't4',
          target: 't5',
        },
        {
          breakpoints: [],
          source: 't5',
          target: 't6',
        },
        {
          breakpoints: [],
          source: 't6',
          target: 't3',
        },
      ],
      elements: [
        {
          incomingArcs: [],
          id: 't1',
          label: 't1',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 't1',
              target: 't2',
            },
          ],
          x: 100,
          y: 160,
        },
        {
          incomingArcs: [
            {
              breakpoints: [],
              source: 't1',
              target: 't2',
            },
          ],
          id: 't2',
          label: 't2',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 't2',
              target: 't4',
            },
          ],
          x: 200,
          y: 160,
        },
        {
          incomingArcs: [
            {
              breakpoints: [],
              source: 't6',
              target: 't3',
            },
          ],
          id: 't3',
          label: 't3',
          layerPos: 0,
          outgoingArcs: [],
          x: 600,
          y: 160,
        },
        {
          incomingArcs: [
            {
              breakpoints: [],
              source: 't2',
              target: 't4',
            },
          ],
          id: 't4',
          label: 't4',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 't4',
              target: 't5',
            },
          ],
          x: 300,
          y: 160,
        },
        {
          incomingArcs: [
            {
              breakpoints: [],
              source: 't4',
              target: 't5',
            },
          ],
          id: 't5',
          label: 't5',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 't5',
              target: 't6',
            },
          ],
          x: 400,
          y: 160,
        },
        {
          incomingArcs: [
            {
              breakpoints: [],
              source: 't5',
              target: 't6',
            },
          ],
          id: 't6',
          label: 't6',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 't6',
              target: 't3',
            },
          ],
          x: 500,
          y: 160,
        },
      ],
      text: '.type run\n.events\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t5\nt5 t6\nt6 t3\n',
      warnings: [],
    });
  });
});

const exampleInput: Run = {
  text: '.type run\n.events\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t5\nt5 t6\nt6 t3\n',
  arcs: [
    { source: 't1', target: 't2', breakpoints: [] },
    { source: 't2', target: 't4', breakpoints: [] },
    { source: 't4', target: 't5', breakpoints: [] },
    { source: 't5', target: 't6', breakpoints: [] },
    { source: 't6', target: 't3', breakpoints: [] },
  ],
  elements: [
    {
      id: 't1',
      label: 't1',
      incomingArcs: [],
      outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
    },
    {
      id: 't2',
      label: 't2',
      incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
      outgoingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
    },
    {
      id: 't3',
      label: 't3',
      incomingArcs: [{ source: 't6', target: 't3', breakpoints: [] }],
      outgoingArcs: [],
    },
    {
      id: 't4',
      label: 't4',
      incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
      outgoingArcs: [{ source: 't4', target: 't5', breakpoints: [] }],
    },
    {
      id: 't5',
      label: 't5',
      incomingArcs: [{ source: 't4', target: 't5', breakpoints: [] }],
      outgoingArcs: [{ source: 't5', target: 't6', breakpoints: [] }],
    },
    {
      id: 't6',
      label: 't6',
      incomingArcs: [{ source: 't5', target: 't6', breakpoints: [] }],
      outgoingArcs: [{ source: 't6', target: 't3', breakpoints: [] }],
    },
  ],
  warnings: [],
};
