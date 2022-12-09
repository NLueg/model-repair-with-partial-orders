import { MaxFlowPreflowN3 } from '../algorithms/algorithms/flow-network/max-flow-preflow-n3';
import { Arc } from '../classes/diagram/arc';
import {
  determineInitialAndFinalEvents,
  PartialOrder,
} from '../classes/diagram/partial-order';
import { PetriNet } from '../classes/diagram/petri-net';
import { Place } from '../classes/diagram/place';
import {
  concatEvents,
  createEventItem,
  EventItem,
  Transition,
} from '../classes/diagram/transition';

// TODO: Refactor this!
// TODO: Try to understand this ...
export class FirePartialOrder {
  private readonly idToEventMap = new Map<string, EventItem>();
  private readonly idToPlaceMap = new Map<string, Place>();

  private readonly petriNet: PetriNet;
  private readonly partialOrder: PartialOrder;

  constructor(petriNet: PetriNet, partialOrder: PartialOrder) {
    this.petriNet = { ...petriNet };
    this.partialOrder = { ...partialOrder };

    for (const e of this.partialOrder.events) {
      for (const t of this.petriNet.transitions) {
        if (e.label === t.label) {
          e.transition = t;
        }
      }
      if (e.transition === undefined) {
        throw new Error(
          `The net does not contain a transition with the label '${e.label}' of the event '${e.id}'`
        );
      }
    }

    const initial: EventItem = createEventItem('initial marking');
    const finalEvent: EventItem = createEventItem('final marking');

    this.partialOrder.events = [
      initial,
      ...this.partialOrder.events,
      finalEvent,
    ];
    this.partialOrder.events.forEach((e) => this.idToEventMap.set(e.id, e));

    this.partialOrder.initialEvents?.forEach((eventId) => {
      const foundEventItem = this.idToEventMap.get(eventId);
      if (foundEventItem) {
        concatEvents(initial, foundEventItem);
      } else {
        console.error(`Event with id ${eventId} not found`);
      }
    });

    this.partialOrder.finalEvents?.forEach((eventId) => {
      const foundEventItem = this.idToEventMap.get(eventId);
      if (foundEventItem) {
        concatEvents(foundEventItem, finalEvent);
      } else {
        console.error(`Event with id ${eventId} not found`);
      }
    });
    determineInitialAndFinalEvents(this.partialOrder);

    this.petriNet.places.forEach((p) => this.idToPlaceMap.set(p.id, p));
  }

  /**
   * Fires the partial order in the net and returns the ids of invalid places.
   * @returns The ids of invalid places.
   */
  getInvalidPlaces(): string[] {
    const totalOrder = this.buildTotalOrdering(this.partialOrder);
    totalOrder.forEach(
      (event) =>
        (event.localMarking = new Array<number>(
          this.petriNet.places.length
        ).fill(0))
    );

    // build start event
    const initialEvent = totalOrder[0];
    for (let i = 0; i < this.petriNet.places.length; i++) {
      initialEvent.localMarking![i] = this.petriNet.places[i].marking;
    }

    const validPlaces = new Array(this.petriNet.places.length).fill(true);
    const complexPlaces = new Array(this.petriNet.places.length).fill(false);
    const notValidPlaces = new Array(this.petriNet.places.length).fill(false);

    let queue = [...totalOrder];
    this.fireForwards(queue, validPlaces, complexPlaces);

    // not valid places
    const finalEvent = this.idToEventMap.get(
      [...this.partialOrder.finalEvents!][0]
    );
    if (!finalEvent) {
      throw new Error('Final event not found');
    }

    for (let i = 0; i < this.petriNet.places.length; i++) {
      notValidPlaces[i] = finalEvent.localMarking![i] < 0;
    }

    // Don't fire all backwards!
    queue = [finalEvent];
    for (let i = totalOrder.length - 2; i >= 0; i--) {
      totalOrder[i].localMarking = new Array<number>(
        this.petriNet.places.length
      ).fill(0);
      queue.push(totalOrder[i]);
    }

    const backwardsValidPlaces = new Array(this.petriNet.places.length).fill(
      true
    );
    const backwardsComplexPlaces = new Array(this.petriNet.places.length).fill(
      false
    );

    // Is the final marking > 0 ?
    for (let i = 0; i < this.petriNet.places.length; i++) {
      if (finalEvent.localMarking![i] < 0) {
        backwardsValidPlaces[i] = false;
      }
    }

    this.fireBackwards(queue, backwardsValidPlaces, backwardsComplexPlaces);

    // Rest with flow
    const flow = new Array(this.petriNet.places.length).fill(false);
    for (let i = 0; i < this.petriNet.places.length; i++) {
      if (
        !validPlaces[i] &&
        complexPlaces[i] &&
        !notValidPlaces[i] &&
        !backwardsValidPlaces[i]
      ) {
        flow[i] = this.checkFlowForPlace(
          this.petriNet.places[i],
          this.partialOrder.events
        );
      }
    }

    return this.petriNet.places
      .filter((p, i) => {
        if (validPlaces[i]) {
          return false;
        } else if (backwardsValidPlaces[i]) {
          return false;
        } else return !flow[i];
      })
      .map((p) => p.id);
  }

  private fireForwards(
    queue: Array<EventItem>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>
  ) {
    this.fire(
      queue,
      validPlaces,
      complexPlaces,
      (t) => t.incomingArcs,
      (a) => this.idToPlaceMap.get(a.source),
      (t) => t.outgoingArcs,
      (a) => this.idToPlaceMap.get(a.target),
      (e) => e.nextEvents
    );
  }

  private fireBackwards(
    queue: Array<EventItem>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>
  ) {
    this.fire(
      queue,
      validPlaces,
      complexPlaces,
      (t) => t.outgoingArcs,
      (a) => this.idToPlaceMap.get(a.target),
      (t) => t.incomingArcs,
      (a) => this.idToPlaceMap.get(a.source),
      (e) => e.previousEvents
    );
  }

  private fire(
    firinQueue: Array<EventItem>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>,
    preArcs: (t: Transition) => Array<Arc>,
    prePlace: (a: Arc) => Place | undefined,
    postArcs: (t: Transition) => Array<Arc>,
    postPlace: (a: Arc) => Place | undefined,
    nextEvents: (e: EventItem) => string[]
  ) {
    while (firinQueue.length > 0) {
      const event = firinQueue.shift();
      if (!event) {
        throw Error('Event is undefined');
      }

      // can fire?
      if (event.transition !== undefined) {
        // fire
        for (const arc of preArcs(event.transition)) {
          const pIndex = this.getPIndex(prePlace(arc));
          event.localMarking![pIndex] =
            event.localMarking![pIndex] - arc.weight;
          if (event.localMarking![pIndex] < 0) {
            validPlaces[pIndex] = false;
          }
        }

        for (const arc of postArcs(event.transition)) {
          const pIndex = this.getPIndex(postPlace(arc));
          event.localMarking![pIndex] =
            event.localMarking![pIndex] + arc.weight;
        }
      }

      // push to first later and check for complex places
      const nextEventsToFire = nextEvents(event);
      if (nextEventsToFire.length > 0) {
        for (let i = 0; i < this.petriNet.places.length; i++) {
          if (nextEventsToFire.length > 1 && event.localMarking![i] > 0) {
            complexPlaces[i] = true;
          }
          const firstLater = [...nextEventsToFire][0];
          const firstLaterEvent = this.idToEventMap.get(
            firstLater
          ) as EventItem;
          firstLaterEvent!.localMarking![i] =
            firstLaterEvent!.localMarking![i] + event.localMarking![i];
        }
      }
    }
  }

  private getPIndex(p?: Place) {
    return this.petriNet.places.findIndex((pp) => pp === p);
  }

  private buildTotalOrdering(partialOrder: PartialOrder): Array<EventItem> {
    const ordering: Array<string> = [
      ...(this.partialOrder.initialEvents ?? []),
    ];
    const contained = partialOrder.initialEvents ?? [];

    const examineLater: Array<EventItem> = [...partialOrder.events];
    while (examineLater.length > 0) {
      const event = examineLater.shift();
      if (!event) {
        throw Error('Event is undefined');
      }

      if (contained.includes(event.id)) {
        continue;
      }
      let add = true;
      for (const pre of event.previousEvents) {
        if (!contained.some((containedEvent) => containedEvent === pre)) {
          add = false;
          break;
        }
      }
      if (add) {
        ordering.push(event.id);
        contained.push(event.id);
      } else {
        examineLater.push(event);
      }
    }

    return ordering.map((id) => this.idToEventMap.get(id) as EventItem);
  }

  private checkFlowForPlace(place: Place, events: Array<EventItem>): boolean {
    const n = events.length * 2 + 2;
    const SOURCE = 0;
    const SINK = n - 1;

    const network = new MaxFlowPreflowN3(n);

    for (let eIndex = 0; eIndex < events.length; eIndex++) {
      network.setUnbounded(this.eventStart(eIndex), this.eventEnd(eIndex));

      const event = events[eIndex];
      const transition = event.transition;
      if (transition === undefined) {
        if (place.marking > 0) {
          network.setCap(SOURCE, this.eventEnd(eIndex), place.marking);
        }
      } else {
        for (const outArc of transition.outgoingArcs) {
          const postPlace = this.idToPlaceMap.get(outArc.target);
          if (postPlace === place) {
            network.setCap(SOURCE, this.eventEnd(eIndex), outArc.weight);
          }
        }
        for (const inArc of transition.incomingArcs) {
          const prePlace = this.idToPlaceMap.get(inArc.source);
          if (prePlace === place) {
            network.setCap(this.eventStart(eIndex), SINK, inArc.weight);
          }
        }
      }
      for (const postEvent of event.nextEvents) {
        network.setUnbounded(
          this.eventEnd(eIndex),
          this.eventStart(events.findIndex((e) => e.id === postEvent))
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

  private eventStart(eventIndex: number): number {
    return eventIndex * 2 + 1;
  }

  private eventEnd(eventIndex: number): number {
    return eventIndex * 2 + 2;
  }
}
