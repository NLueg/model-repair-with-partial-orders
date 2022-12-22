import clonedeep from 'lodash.clonedeep';

import { Arc } from '../../classes/diagram/arc';
import {
  determineInitialAndFinalEvents,
  PartialOrder,
} from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import {
  concatEvents,
  createEventItem,
  EventItem,
  Transition,
} from '../../classes/diagram/transition';
import { MaxFlowPreflowN3 } from './max-flow-preflow-n3';

export class ValidationResult {
  public valid: boolean;
  public phase: ValidationPhase;

  constructor(valid: boolean, phase: ValidationPhase) {
    this.valid = valid;
    this.phase = phase;
  }
}

export enum ValidationPhase {
  FLOW = 'flow',
  FORWARDS = 'forwards',
  BACKWARDS = 'backwards',
}

type InnerFireResult = { branchPlaces: string[] };

export class FirePartialOrder {
  private readonly idToEventMap = new Map<string, EventItem>();
  private readonly idToPlaceMap = new Map<string, Place>();
  private readonly labelToTransitionMap = new Map<string, Transition>();

  private readonly petriNet: PetriNet;
  private readonly partialOrder: PartialOrder;

  constructor(petriNet: PetriNet, partialOrder: PartialOrder) {
    this.petriNet = { ...petriNet };
    this.partialOrder = clonedeep(partialOrder);

    this.petriNet.transitions.forEach((t) =>
      this.labelToTransitionMap.set(t.label, t)
    );
    this.petriNet.places.forEach((p) => this.idToPlaceMap.set(p.id, p));
  }

  /**
   * Fires the partial order in the net and returns the ids of invalid places.
   * @returns The ids of invalid places.
   */
  getInvalidPlaces(): string[] {
    this.buildExtensionForPartialOrder();

    const totalOrder = this.buildTotalOrder(this.partialOrder);

    // Adds the initial marking to the first event.
    const initialEvent = totalOrder[0];
    for (let i = 0; i < this.petriNet.places.length; i++) {
      initialEvent.localMarking![i] = this.petriNet.places[i].marking;
    }

    const validPlaces = new Array(this.petriNet.places.length).fill(true);
    const notValidPlaces = new Array(this.petriNet.places.length).fill(false);

    const forwardResult = this.fireForwards([...totalOrder], validPlaces);

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
    const backwardsFireQueue = [finalEvent];
    for (let i = totalOrder.length - 2; i >= 0; i--) {
      totalOrder[i].localMarking = new Array<number>(
        this.petriNet.places.length
      ).fill(0);
      backwardsFireQueue.push(totalOrder[i]);
    }

    const backwardsValidPlaces = new Array(this.petriNet.places.length).fill(
      true
    );

    // Is the final marking > 0 ?
    for (let i = 0; i < this.petriNet.places.length; i++) {
      if (finalEvent.localMarking![i] < 0) {
        backwardsValidPlaces[i] = false;
      }
    }

    this.fireBackwards(backwardsFireQueue, backwardsValidPlaces);

    // Rest with flow
    const flow = new Array(this.petriNet.places.length).fill(false);
    for (let i = 0; i < this.petriNet.places.length; i++) {
      if (
        !validPlaces[i] &&
        forwardResult.branchPlaces.includes(this.petriNet.places[i].id) &&
        !notValidPlaces[i] &&
        !backwardsValidPlaces[i]
      ) {
        flow[i] = this.checkFlowForPlace(
          this.petriNet.places[i],
          this.partialOrder.events
        );
      }
    }

    /**
     * return this.petriNet.places.map((p, i) => {
     *       if (validPlaces[i]) {
     *         return new ValidationResult(true, ValidationPhase.FORWARDS);
     *       } else if (backwardsValidPlaces[i]) {
     *         return new ValidationResult(true, ValidationPhase.BACKWARDS);
     *       } else if (flow[i]) {
     *         return new ValidationResult(true, ValidationPhase.FLOW);
     *       } else if (notValidPlaces[i]) {
     *         return new ValidationResult(false, ValidationPhase.FORWARDS);
     *       } else {
     *         return new ValidationResult(false, ValidationPhase.FLOW);
     *       }
     *     });
     */

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

  /**
   * Builds the extension for a partial order with an initial and final event.
   * @private
   */
  private buildExtensionForPartialOrder(): void {
    const initial: EventItem = createEventItem('initial_marking');
    const finalEvent: EventItem = createEventItem('final_marking');

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
  }

  private fireForwards(
    queue: Array<EventItem>,
    validPlaces: Array<boolean>
  ): InnerFireResult {
    return this.fire(
      queue,
      validPlaces,
      (t) => t.incomingArcs,
      (a) => this.idToPlaceMap.get(a.source),
      (t) => t.outgoingArcs,
      (a) => this.idToPlaceMap.get(a.target),
      (e) => e.nextEvents
    );
  }

  private fireBackwards(queue: Array<EventItem>, validPlaces: Array<boolean>) {
    this.fire(
      queue,
      validPlaces,
      (t) => t.outgoingArcs,
      (a) => this.idToPlaceMap.get(a.target),
      (t) => t.incomingArcs,
      (a) => this.idToPlaceMap.get(a.source),
      (e) => e.previousEvents
    );
  }

  private fire(
    eventQueue: Array<EventItem>,
    validPlaces: Array<boolean>,
    preArcs: (t: Transition) => Array<Arc>,
    prePlace: (a: Arc) => Place | undefined,
    postArcs: (t: Transition) => Array<Arc>,
    postPlace: (a: Arc) => Place | undefined,
    nextEvents: (e: EventItem) => string[]
  ): InnerFireResult {
    const branchPlaces: string[] = [];

    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (!event) {
        throw Error('Event is undefined');
      }

      // can fire?
      const transition = this.labelToTransitionMap.get(event.label);
      if (transition) {
        // fire
        for (const arc of preArcs(transition)) {
          const pIndex = this.getPlaceIndex(prePlace(arc));
          event.localMarking![pIndex] =
            event.localMarking![pIndex] - arc.weight;
          if (event.localMarking![pIndex] < 0) {
            validPlaces[pIndex] = false;
          }
        }

        for (const arc of postArcs(transition)) {
          const pIndex = this.getPlaceIndex(postPlace(arc));
          event.localMarking![pIndex] =
            event.localMarking![pIndex] + arc.weight;
        }
      }

      // push to first later and check for complex places
      const nextEventsToFire = nextEvents(event);
      if (nextEventsToFire.length > 0) {
        for (let i = 0; i < this.petriNet.places.length; i++) {
          if (nextEventsToFire.length > 1 && event.localMarking![i] > 0) {
            branchPlaces.push(this.petriNet.places[i].id);
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

    return { branchPlaces };
  }

  private buildTotalOrder(partialOrder: PartialOrder): Array<EventItem> {
    const ordering = [...(partialOrder.initialEvents ?? [])];
    const contained = [...(partialOrder.initialEvents ?? [])];

    const eventsToCheck: Array<EventItem> = [...partialOrder.events];
    while (eventsToCheck.length > 0) {
      const event = eventsToCheck.shift();

      // The event is already contained in the ordering
      if (!event || contained.includes(event.id)) {
        continue;
      }

      let previousEventContained = true;
      for (const pre of event.previousEvents) {
        if (!contained.some((containedEvent) => containedEvent === pre)) {
          previousEventContained = false;
          break;
        }
      }

      if (previousEventContained) {
        ordering.push(event.id);
        contained.push(event.id);
      } else {
        eventsToCheck.push(event);
      }
    }

    return ordering.map((id) => {
      const eventItem = this.idToEventMap.get(id) as EventItem;

      eventItem.localMarking = new Array<number>(
        this.petriNet.places.length
      ).fill(0);

      return eventItem;
    });
  }

  private checkFlowForPlace(place: Place, events: Array<EventItem>): boolean {
    const n = events.length * 2 + 2;
    const SOURCE = 0;
    const SINK = n - 1;

    const network = new MaxFlowPreflowN3(n);

    for (let eIndex = 0; eIndex < events.length; eIndex++) {
      network.setUnbounded(eventStart(eIndex), eventEnd(eIndex));

      const event = events[eIndex];
      const transition = this.labelToTransitionMap.get(event.label);
      if (transition === undefined) {
        if (place.marking > 0) {
          network.setCap(SOURCE, eventEnd(eIndex), place.marking);
        }
      } else {
        for (const outArc of transition.outgoingArcs) {
          const postPlace = this.idToPlaceMap.get(outArc.target);
          if (postPlace === place) {
            network.setCap(SOURCE, eventEnd(eIndex), outArc.weight);
          }
        }
        for (const inArc of transition.incomingArcs) {
          const prePlace = this.idToPlaceMap.get(inArc.source);
          if (prePlace === place) {
            network.setCap(eventStart(eIndex), SINK, inArc.weight);
          }
        }
      }
      for (const postEvent of event.nextEvents) {
        network.setUnbounded(
          eventEnd(eIndex),
          eventStart(events.findIndex((e) => e.id === postEvent))
        );
      }
    }

    let need = 0;
    for (let ii = 0; ii < n; ii++) {
      need += network.getCap(ii, SINK);
    }
    const f = network.maxFlow(SOURCE, SINK);
    return need === f;
  }

  private getPlaceIndex(placeToCheck?: Place) {
    return this.petriNet.places.findIndex((place) => place === placeToCheck);
  }
}

function eventStart(eventIndex: number): number {
  return eventIndex * 2 + 1;
}

function eventEnd(eventIndex: number): number {
  return eventIndex * 2 + 2;
}
