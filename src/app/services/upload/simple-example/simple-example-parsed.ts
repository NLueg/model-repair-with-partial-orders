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
    {
      breakpoints: [],
      source: 'b',
      target: 'p3',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p3',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p3',
      target: 'd',
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
    {
      id: 'p3',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'b',
          target: 'p3',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p3',
          weight: 1,
        },
      ],
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
      ],
      label: 'c',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p3',
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
      ],
      label: 'd',
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
};

export const parsedSimpleExampleLogInvalidSecond: PartialOrder = {
  arcs: [
    {
      breakpoints: [],
      source: 'E1',
      target: 'E3',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'E3',
      target: 'E2',
      weight: 1,
    },
  ],
  events: [
    {
      id: 'E1',
      incomingArcs: [],
      label: 'a',
      nextEvents: ['E3'],
      outgoingArcs: [],
      previousEvents: [],
      type: 'event',
    },
    {
      id: 'E2',
      incomingArcs: [],
      label: 'b',
      nextEvents: [],
      outgoingArcs: [],
      previousEvents: ['E3'],
      type: 'event',
    },
    {
      id: 'E3',
      incomingArcs: [],
      label: 'c',
      nextEvents: ['E2'],
      outgoingArcs: [],
      previousEvents: ['E1'],
      type: 'event',
    },
  ],
  finalEvents: ['E3'],
  initialEvents: ['E1'],
};
