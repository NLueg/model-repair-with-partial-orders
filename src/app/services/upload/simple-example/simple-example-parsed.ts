import { PartialOrder } from '../../../classes/diagram/partial-order';

export const parsedSimpleExamplePetriNet = {
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
      source: 'p2',
      target: 'b',
      weight: 1,
    },
  ],
  places: [
    {
      id: 'p1',
      incomingArcs: [],
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
  ],
  text: '.type pn\n.transitions\na a\nb b\nc c\n.places\np1 1\np2 0\n.arcs\np1 a\na p2\np2 c\np2 b\n',
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
      outgoingArcs: [],
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
      ],
      label: 'c',
      outgoingArcs: [],
      type: 'transition',
    },
  ],
};

export const parsedSimpleExampleLogInvalid: PartialOrder = {
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
      nextEvents: [],
      outgoingArcs: [],
      previousEvents: ['e2'],
      type: 'event',
    },
  ],
  finalEvents: ['e3'],
  initialEvents: ['e1'],
  text: '.type log\n.events\ne1 a\ne2 b\ne3 c\n.arcs\ne1 e2\ne2 e3\n',
};
