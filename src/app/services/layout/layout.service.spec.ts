import { TestBed } from '@angular/core/testing';

import { LayoutService } from './layout.service';
import { parsedPetriNet } from './upload/example-file-parsed';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  xit('should layout example content correctly', () => {
    const { net, point } = service.layout(parsedPetriNet);

    expect(point).toEqual({ x: 650, y: 140 });
    expect(net).toEqual({
      arcs: [
        {
          breakpoints: [],
          source: 'p1',
          target: 'a',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'a',
          target: 'p2',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p2',
          target: 'b',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p2',
          target: 'c',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'b',
          target: 'p3',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p4',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p3',
          target: 'd',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p4',
          target: 'd',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'd',
          target: 'p5',
          weight: 1,
        },
      ],
      places: [
        {
          id: 'p1',
          incomingArcs: [],
          layerPos: 0,
          marking: 1,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'p1',
              target: 'a',
              weight: 1,
            },
          ],
          type: 'place',
          x: 25,
          y: 70,
        },
        {
          id: 'p2',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'a',
              target: 'p2',
              weight: 1,
            },
          ],
          layerPos: 0,
          marking: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'p2',
              target: 'b',
              weight: 1,
            },
            {
              breakpoints: [],
              source: 'p2',
              target: 'c',
              weight: 1,
            },
          ],
          type: 'place',
          x: 225,
          y: 70,
        },
        {
          id: 'p3',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'b',
              target: 'p3',
              weight: 1,
            },
          ],
          layerPos: 0,
          marking: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'p3',
              target: 'd',
              weight: 1,
            },
          ],
          type: 'place',
          x: 425,
          y: 25,
        },
        {
          id: 'p4',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'c',
              target: 'p4',
              weight: 1,
            },
          ],
          layerPos: 1,
          marking: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'p4',
              target: 'd',
              weight: 1,
            },
          ],
          type: 'place',
          x: 425,
          y: 115,
        },
        {
          id: 'p5',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'd',
              target: 'p5',
              weight: 1,
            },
          ],
          layerPos: 0,
          marking: 0,
          outgoingArcs: [],
          type: 'place',
          x: 625,
          y: 70,
        },
      ],
      transitions: [
        {
          id: 'a',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'p1',
              target: 'a',
              weight: 1,
            },
          ],
          label: 'a',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'a',
              target: 'p2',
              weight: 1,
            },
          ],
          type: 'transition',
          x: 125,
          y: 70,
        },
        {
          id: 'b',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'p2',
              target: 'b',
              weight: 1,
            },
          ],
          label: 'b',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'b',
              target: 'p3',
              weight: 1,
            },
          ],
          type: 'transition',
          x: 325,
          y: 25,
        },
        {
          id: 'c',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'p2',
              target: 'c',
              weight: 1,
            },
          ],
          label: 'c',
          layerPos: 1,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'c',
              target: 'p4',
              weight: 1,
            },
          ],
          type: 'transition',
          x: 325,
          y: 115,
        },
        {
          id: 'd',
          incomingArcs: [
            {
              breakpoints: [],
              source: 'p3',
              target: 'd',
              weight: 1,
            },
            {
              breakpoints: [],
              source: 'p4',
              target: 'd',
              weight: 1,
            },
          ],
          label: 'd',
          layerPos: 0,
          outgoingArcs: [
            {
              breakpoints: [],
              source: 'd',
              target: 'p5',
              weight: 1,
            },
          ],
          type: 'transition',
          x: 525,
          y: 70,
        },
      ],
    });
  });
});
