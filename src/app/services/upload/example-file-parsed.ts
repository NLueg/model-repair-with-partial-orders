import { EventLog } from '../../classes/diagram/event-log';
import { PetriNet } from '../../classes/diagram/petri-net';

export const parsedPetriNet: PetriNet = {
  arcs: [
    {
      breakpoints: [],
      source: 'p1',
      target: 'a',
    },
    {
      breakpoints: [],
      source: 'a',
      target: 'p2',
    },
    {
      breakpoints: [],
      source: 'p2',
      target: 'c',
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p5',
    },
    {
      breakpoints: [],
      source: 'p5',
      target: 'a',
    },
    {
      breakpoints: [],
      source: 'p2',
      target: 'b',
    },
    {
      breakpoints: [],
      source: 'b',
      target: 'p3',
    },
    {
      breakpoints: [],
      source: 'p3',
      target: 'd',
    },
    {
      breakpoints: [],
      source: 'd',
      target: 'p7',
    },
    {
      breakpoints: [],
      source: 'p7',
      target: 'd',
    },
    {
      breakpoints: [],
      source: 'p7',
      target: 'c',
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p7',
    },
    {
      breakpoints: [],
      source: 'd',
      target: 'p6',
    },
    {
      breakpoints: [],
      source: 'c',
      target: 'p4',
    },
    {
      breakpoints: [],
      source: 'p4',
      target: 'e',
    },
    {
      breakpoints: [],
      source: 'e',
      target: 'p6',
    },
    {
      breakpoints: [],
      source: 'p6',
      target: 'f',
    },
  ],
  places: [
    {
      id: 'p1',
      incomingArcs: [],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p1',
          target: 'a',
        },
      ],
      marking: 2,
      type: 'place',
    },
    {
      id: 'p2',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'a',
          target: 'p2',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p2',
          target: 'c',
        },
        {
          breakpoints: [],
          source: 'p2',
          target: 'b',
        },
      ],
      marking: 0,
      type: 'place',
    },
    {
      id: 'p3',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'b',
          target: 'p3',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p3',
          target: 'd',
        },
      ],
      marking: 1,
      type: 'place',
    },
    {
      id: 'p4',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p4',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p4',
          target: 'e',
        },
      ],
      marking: 2,
      type: 'place',
    },
    {
      id: 'p5',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p5',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p5',
          target: 'a',
        },
      ],
      marking: 1,
      type: 'place',
    },
    {
      id: 'p6',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p6',
        },
        {
          breakpoints: [],
          source: 'e',
          target: 'p6',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p6',
          target: 'f',
        },
      ],
      marking: 0,
      type: 'place',
    },
    {
      id: 'p7',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p7',
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p7',
        },
      ],
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p7',
          target: 'd',
        },
        {
          breakpoints: [],
          source: 'p7',
          target: 'c',
        },
      ],
      marking: 1,
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
        },
        {
          breakpoints: [],
          source: 'p5',
          target: 'a',
        },
      ],
      label: 'a',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'a',
          target: 'p2',
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
        },
      ],
      label: 'b',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'b',
          target: 'p3',
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
        },
        {
          breakpoints: [],
          source: 'p7',
          target: 'c',
        },
      ],
      label: 'c',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'c',
          target: 'p5',
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p7',
        },
        {
          breakpoints: [],
          source: 'c',
          target: 'p4',
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
        },
        {
          breakpoints: [],
          source: 'p7',
          target: 'd',
        },
      ],
      label: 'd',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'd',
          target: 'p7',
        },
        {
          breakpoints: [],
          source: 'd',
          target: 'p6',
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
        },
      ],
      label: 'e',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'e',
          target: 'p6',
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
        },
      ],
      label: 'f',
      outgoingArcs: [],
      type: 'transition',
    },
  ],
};

export const parsedPartialOrder: EventLog = {
  arcs: [
    {
      breakpoints: [],
      source: 'e1',
      target: 'e3',
    },
    {
      breakpoints: [],
      source: 'e2',
      target: 'e3',
    },
    {
      breakpoints: [],
      source: 'e3',
      target: 'e4',
    },
    {
      breakpoints: [],
      source: 'e4',
      target: 'e5',
    },
    {
      breakpoints: [],
      source: 'e5',
      target: 'e6',
    },
    {
      breakpoints: [],
      source: 'e6',
      target: 'e8',
    },
    {
      breakpoints: [],
      source: 'e3',
      target: 'e7',
    },
    {
      breakpoints: [],
      source: 'e7',
      target: 'e8',
    },
  ],
  text: '.type log\n.events\ne1 a\ne2 d\ne3 c\ne4 a\ne5 b\ne6 d\ne7 e\ne8 f\n.arcs\ne1 e3\ne2 e3\ne3 e4\ne4 e5\ne5 e6\ne6 e8\ne3 e7\ne7 e8\n',
  events: [
    {
      id: 'e1',
      incomingArcs: [],
      label: 'a',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e2',
      incomingArcs: [],
      label: 'd',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e3',
      incomingArcs: [],
      label: 'c',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e4',
      incomingArcs: [],
      label: 'a',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e5',
      incomingArcs: [],
      label: 'b',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e6',
      incomingArcs: [],
      label: 'd',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e7',
      incomingArcs: [],
      label: 'e',
      outgoingArcs: [],
      type: 'transition',
    },
    {
      id: 'e8',
      incomingArcs: [],
      label: 'f',
      outgoingArcs: [],
      type: 'transition',
    },
  ],
};
