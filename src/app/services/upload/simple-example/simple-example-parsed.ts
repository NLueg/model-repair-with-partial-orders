import { PetriNet } from '../../../classes/diagram/petri-net';

export const parsedSimpleExamplePetriNet: PetriNet = {
  arcs: [
    {
      breakpoints: [],
      source: 'p0',
      target: 'rp',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'rp',
      target: 'p1',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p1',
      target: 'op',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'op',
      target: 'p2',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'op',
      target: 'p3',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p3',
      target: 'hs',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'hs',
      target: 'p5',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p5',
      target: 'hb',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'hb',
      target: 'p7',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p7',
      target: 'ud',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'ud',
      target: 'p8',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p2',
      target: 'fs',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'fs',
      target: 'p4',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p4',
      target: 'fb',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'fb',
      target: 'p6',
      weight: 1,
    },
    {
      breakpoints: [],
      source: 'p6',
      target: 'ud',
      weight: 1,
    },
  ],
  places: [
    {
      id: 'p0',
      incomingArcs: [],
      marking: 1,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p0',
          target: 'rp',
          weight: 1,
        },
      ],
      type: 'place',
    },
    {
      id: 'p1',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'rp',
          target: 'p1',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p1',
          target: 'op',
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
          source: 'op',
          target: 'p2',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p2',
          target: 'fs',
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
          source: 'op',
          target: 'p3',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p3',
          target: 'hs',
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
          source: 'fs',
          target: 'p4',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p4',
          target: 'fb',
          weight: 1,
        },
      ],
      type: 'place',
    },
    {
      id: 'p5',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'hs',
          target: 'p5',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p5',
          target: 'hb',
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
          source: 'fb',
          target: 'p6',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p6',
          target: 'ud',
          weight: 1,
        },
      ],
      type: 'place',
    },
    {
      id: 'p7',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'hb',
          target: 'p7',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'p7',
          target: 'ud',
          weight: 1,
        },
      ],
      type: 'place',
    },
    {
      id: 'p8',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'ud',
          target: 'p8',
          weight: 1,
        },
      ],
      marking: 0,
      outgoingArcs: [],
      type: 'place',
    },
  ],
  transitions: [
    {
      id: 'rp',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p0',
          target: 'rp',
          weight: 1,
        },
      ],
      label: 'Reise_planen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'rp',
          target: 'p1',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'op',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p1',
          target: 'op',
          weight: 1,
        },
      ],
      label: 'Optionen_prüfen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'op',
          target: 'p2',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'op',
          target: 'p3',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'fs',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p2',
          target: 'fs',
          weight: 1,
        },
      ],
      label: 'Flug_suchen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'fs',
          target: 'p4',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'hs',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p3',
          target: 'hs',
          weight: 1,
        },
      ],
      label: 'Hotel_suchen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'hs',
          target: 'p5',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'fb',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p4',
          target: 'fb',
          weight: 1,
        },
      ],
      label: 'Flug_buchen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'fb',
          target: 'p6',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'hb',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p5',
          target: 'hb',
          weight: 1,
        },
      ],
      label: 'Hotel_buchen',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'hb',
          target: 'p7',
          weight: 1,
        },
      ],
      type: 'transition',
    },
    {
      id: 'ud',
      incomingArcs: [
        {
          breakpoints: [],
          source: 'p7',
          target: 'ud',
          weight: 1,
        },
        {
          breakpoints: [],
          source: 'p6',
          target: 'ud',
          weight: 1,
        },
      ],
      label: 'Unterlagen_drucken',
      outgoingArcs: [
        {
          breakpoints: [],
          source: 'ud',
          target: 'p8',
          weight: 1,
        },
      ],
      type: 'transition',
    },
  ],
};
