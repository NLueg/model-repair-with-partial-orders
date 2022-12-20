import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';

export const parsedPetriNet: PetriNet = {
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
      target: 'c',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p5',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p5',
      target: 'a',
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
      source: 'b',
      target: 'p3',
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
      source: 'd',
      target: 'p7',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p7',
      target: 'd',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p7',
      target: 'c',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p7',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'd',
      target: 'p6',
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
      source: 'p4',
      target: 'e',
      weight: 3,
    },
    {
      breakpoints: [],
      source: 'e',
      target: 'p6',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p6',
      target: 'f',
      weight: 3,
    },
  ],
  places: [
    {
      id: 'p1',
      incomingArcs: [],
      marking: 2,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p1',
          target: 'a',
          weight: 1,
        },
      ],
      type: 'place',
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
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p2',
          target: 'c',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p2',
          target: 'b',
          weight: 1,
        },
      ],
      type: 'place',
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
      marking: 1,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p3',
          target: 'd',
          weight: 1,
        },
      ],
      type: 'place',
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
      marking: 2,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p4',
          target: 'e',
          weight: 3,
        },
      ],
      type: 'place',
    },
    {
      id: 'p5',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p5',
          weight: 1,
        },
      ],
      marking: 1,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p5',
          target: 'a',
          weight: 1,
        },
      ],
      type: 'place',
    },
    {
      id: 'p6',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p6',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'e',
          target: 'p6',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p6',
          target: 'f',
          weight: 3,
        },
      ],
      type: 'place',
    },
    {
      id: 'p7',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p7',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p7',
          weight: 1,
        },
      ],
      marking: 1,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p7',
          target: 'd',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p7',
          target: 'c',
          weight: 1,
        },
      ],
      type: 'place',
    },
  ],
  text: '.type pn\n.transitions\na a\nb b\nc c\nd d\ne e\nf f\n.places\np1 2\np2 0\np3 1\np4 2\np5 1\np6 0\np7 1\n.arcs\np1 a\na p2\np2 c\nc p5\np5 a\np2 b\nb p3\np3 d\nd p7\np7 d\np7 c\nc p7\nd p6\nc p4\np4 e 3\ne p6\np6 f 3\n',
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
        {
          breakpoints: [],
          source: 'p5',
          target: 'a',
          weight: 1,
        },
      ],
      label: 'a',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'a',
          target: 'p2',
          weight: 1,
        },
      ],
      type: 'transition',
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
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'b',
          target: 'p3',
          weight: 1,
        },
      ],
      type: 'transition',
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
        {
          breakpoints: [],
          source: 'p7',
          target: 'c',
          weight: 1,
        },
      ],
      label: 'c',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p5',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p7',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p4',
          weight: 1,
        },
      ],
      type: 'transition',
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
          source: 'p7',
          target: 'd',
          weight: 1,
        },
      ],
      label: 'd',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p7',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'd',
          target: 'p6',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'e',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p4',
          target: 'e',
          weight: 3,
        },
      ],
      label: 'e',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'e',
          target: 'p6',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'f',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p6',
          target: 'f',
          weight: 3,
        },
      ],
      label: 'f',
      outgoingArcs: [],
      type: 'transition',
    },
  ],
};

export const parsedPartialOrder: PartialOrder = {
  arcs: [
    {
      breakpoints: [],
      source: 'e1',
      target: 'e3',
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
    {
      breakpoints: [],
      source: 'e4',
      target: 'e5',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'e5',
      target: 'e6',
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
      source: 'e3',
      target: 'e7',
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
      id: 'e1',
      incomingArcs: [],
      label: 'a',
      nextEvents: ['e3'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'e2',
      incomingArcs: [],
      label: 'd',
      nextEvents: ['e3'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'e3',
      incomingArcs: [],
      label: 'c',
      nextEvents: ['e4', 'e7'],
      outgoingArcs: [],
      previousEvents: ['e1', 'e2'],
      type: 'event',
    },
    {
      id: 'e4',
      incomingArcs: [],
      label: 'a',
      nextEvents: ['e5'],
      outgoingArcs: [],
      previousEvents: ['e3'],
      type: 'event',
    },
    {
      id: 'e5',
      incomingArcs: [],
      label: 'b',
      nextEvents: ['e6'],
      outgoingArcs: [],
      previousEvents: ['e4'],
      type: 'event',
    },
    {
      id: 'e6',
      incomingArcs: [],
      label: 'd',
      nextEvents: ['e8'],
      outgoingArcs: [],
      previousEvents: ['e5'],
      type: 'event',
    },
    {
      id: 'e7',
      incomingArcs: [],
      label: 'e',
      nextEvents: ['e8'],
      outgoingArcs: [],
      previousEvents: ['e3'],
      type: 'event',
    },
    {
      id: 'e8',
      incomingArcs: [],
      label: 'f',
      nextEvents: [],
      outgoingArcs: [],
      previousEvents: ['e6', 'e7'],
      type: 'event',
    },
  ],
  finalEvents: ['e8'],
  initialEvents: ['e1', 'e2'],
  text: '.type log\n.events\ne1 a\ne2 d\ne3 c\ne4 a\ne5 b\ne6 d\ne7 e\ne8 f\n.arcs\ne1 e3\ne2 e3\ne3 e4\ne4 e5\ne5 e6\ne6 e8\ne3 e7\ne7 e8\n',
};

export const parsedInvalidPartialorder: PartialOrder = {
  arcs: [
    {
      breakpoints: [],
      source: 'e1',
      target: 'e3',
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
      source: 'e4',
      target: 'e5',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'e5',
      target: 'e6',
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
      source: 'e3',
      target: 'e7',
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
      id: 'e1',
      incomingArcs: [],
      label: 'a',
      nextEvents: ['e3'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'e2',
      incomingArcs: [],
      label: 'd',
      nextEvents: ['e3'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'e3',
      incomingArcs: [],
      label: 'c',
      nextEvents: ['e7'],
      outgoingArcs: [],
      previousEvents: ['e1', 'e2'],
      type: 'event',
    },
    {
      id: 'e4',
      incomingArcs: [],
      label: 'a',
      nextEvents: ['e5'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'e5',
      incomingArcs: [],
      label: 'b',
      nextEvents: ['e6'],
      outgoingArcs: [],
      previousEvents: ['e4'],
      type: 'event',
    },
    {
      id: 'e6',
      incomingArcs: [],
      label: 'd',
      nextEvents: ['e8'],
      outgoingArcs: [],
      previousEvents: ['e5'],
      type: 'event',
    },
    {
      id: 'e7',
      incomingArcs: [],
      label: 'e',
      nextEvents: ['e8'],
      outgoingArcs: [],
      previousEvents: ['e3'],
      type: 'event',
    },
    {
      id: 'e8',
      incomingArcs: [],
      label: 'f',
      nextEvents: [],
      outgoingArcs: [],
      previousEvents: ['e6', 'e7'],
      type: 'event',
    },
  ],
  finalEvents: ['e8'],
  initialEvents: ['e1', 'e2', 'e4'],
  text: '.type log\n.events\ne1 a\ne2 d\ne3 c\ne4 a\ne5 b\ne6 d\ne7 e\ne8 f\n.arcs\ne1 e3\ne2 e3\ne4 e5\ne5 e6\ne6 e8\ne3 e7\ne7 e8\n',
};
