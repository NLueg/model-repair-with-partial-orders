import { EventLog } from '../../classes/diagram/event-log';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { EventItem } from '../../classes/diagram/transition';
import { MaxFlowPreflowN3 } from './flow-network/max-flow-preflow-n3';

export type InValidPlaceIds = string[];

export function firePartialOrder(
  net: PetriNet,
  log: EventLog
): InValidPlaceIds {
  const flow: Array<ValidationResult> = [];
  const events = log.events;

  for (let i = 0; i < net.places.length; i++) {
    const place = net.places[i];
    flow[i] = {
      valid: checkFlowForPlace(net, place, events),
      phase: 'flow',
    };
  }
  // TODO: DO IT!

  // calculate minutes since yesterday

  return [];
}

function checkFlowForPlace(
  net: PetriNet,
  place: Place,
  events: Array<EventItem>
): boolean {
  const n = events.length * 2 + 2;
  const SOURCE = 0;
  const SINK = n - 1;

  const network = new MaxFlowPreflowN3(n);

  for (let eIndex = 0; eIndex < events.length; eIndex++) {
    network.setUnbounded(eventStart(eIndex), eventEnd(eIndex));

    const event = events[eIndex];
    const transition = net.transitions.find((t) => t.label === event.label);

    if (transition === undefined) {
      if (place.marking > 0) {
        network.setCap(SOURCE, eventEnd(eIndex), place.marking);
      }
    } else {
      for (const outArc of transition.outgoingArcs) {
        const postPlace = net.places.find((p) => p.id === outArc.target);
        if (postPlace === place) {
          network.setCap(SOURCE, eventEnd(eIndex), outArc.weight);
        }
      }
      for (const inArc of transition.incomingArcs) {
        const postPlace = net.places.find((p) => p.id === inArc.target);
        if (postPlace === place) {
          network.setCap(eventStart(eIndex), SINK, inArc.weight);
        }
      }
    }

    for (const postEvent of event.nextEvents) {
      network.setUnbounded(
        eventEnd(eIndex),
        eventStart(events.findIndex((e) => e === postEvent))
      );
    }
  }

  let need = 0;
  for (let ii = 0; ii < n; ii++) {
    need += network.getCap(ii, SINK);
  }
  const f = network.maxFlow(SOURCE, SINK);
  console.debug(`flow ${place.id} ${f}`);
  console.debug(`need ${place.id} ${need}`);
  return need === f;
}

function eventStart(eventIndex: number): number {
  return eventIndex * 2 + 1;
}

function eventEnd(eventIndex: number): number {
  return eventIndex * 2 + 2;
}

export type ValidationResult = {
  valid: boolean;
  phase: ValidationPhase;
};

export type ValidationPhase = 'flow' | 'forwards' | 'backwards';
