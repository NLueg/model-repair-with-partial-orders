import { Arc } from '../../../models/pn/model/arc';
import { PetriNet } from '../../../models/pn/model/petri-net';
import { Place } from '../../../models/pn/model/place';
import { Transition } from '../../../models/pn/model/transition';
import { Event } from '../../../models/po/event';
import { PartialOrder } from '../../../models/po/partial-order';
import { MaxFlowPreflowN3 } from '../../flow-network/max-flow-preflow-n3';
import { ValidationPhase, ValidationResult } from './classes/validation-result';

export class LpoFireValidator {
  private readonly _places: Array<Place>;
  protected readonly _petriNet: PetriNet;
  protected readonly _lpo: PartialOrder;

  constructor(petriNet: PetriNet, lpo: PartialOrder) {
    this._petriNet = petriNet;
    this._lpo = lpo;
    this._places = this._petriNet.getPlaces();
    this.modifyLPO();
  }

  private modifyLPO(): void {
    for (const e of this._lpo.events) {
      for (const t of this._petriNet.getTransitions()) {
        if (e.label === t.label) {
          if (e.transition !== undefined) {
            throw new Error(
              `The algorithm does not support label-splitted nets`
            );
          }
          e.transition = t;
        }
      }
      if (e.transition === undefined) {
        throw new Error(
          `The net does not contain a transition with the label '${e.label}' of the event '${e.id}'`
        );
      }
    }
    const initial = new Event('initial marking', undefined);
    const final = new Event('final marking', undefined);
    for (const e of this._lpo.initialEvents) {
      initial.addNextEvent(e);
    }
    for (const e of this._lpo.finalEvents) {
      e.addNextEvent(final);
    }
    this._lpo.addEvent(initial);
    this._lpo.addEvent(final);
    this._lpo.determineInitialAndFinalEvents();
  }

  validate(): Array<ValidationResult> {
    const totalOrder = this.buildTotalOrdering();
    totalOrder.forEach((e) => e.initializeLocalMarking(this._places.length));

    // build start event
    const initialEvent = totalOrder[0];
    for (let i = 0; i < this._places.length; i++) {
      initialEvent.localMarking![i] = this._places[i].marking;
    }

    const validPlaces = this.newBoolArray(true);
    const complexPlaces = this.newBoolArray(false);
    const notValidPlaces = this.newBoolArray(false);

    let queue = [...totalOrder];
    this.fireForwards(queue, validPlaces, complexPlaces);

    // not valid places
    const finalEvent = [...this._lpo.finalEvents][0];
    for (let i = 0; i < this._places.length; i++) {
      notValidPlaces[i] = finalEvent.localMarking![i] < 0;
    }

    // Don't fire all backwards!
    queue = [finalEvent];
    for (let i = totalOrder.length - 2; i >= 0; i--) {
      totalOrder[i].initializeLocalMarking(this._places.length);
      queue.push(totalOrder[i]);
    }

    const backwardsValidPlaces = this.newBoolArray(true);
    const backwardsComplexPlaces = this.newBoolArray(false);

    // Is the final marking > 0 ?
    for (let i = 0; i < this._places.length; i++) {
      if (finalEvent.localMarking![i] < 0) {
        backwardsValidPlaces[i] = false;
      }
    }

    this.fireBackwards(queue, backwardsValidPlaces, backwardsComplexPlaces);

    // Rest with flow
    const flow = this.newBoolArray(false);
    for (let i = 0; i < this._places.length; i++) {
      if (
        !validPlaces[i] &&
        complexPlaces[i] &&
        !notValidPlaces[i] &&
        !backwardsValidPlaces[i]
      ) {
        flow[i] = checkFlowForPlace(this._places[i], this._lpo.events);
      }
    }

    return this._places.map((p, i) => {
      if (validPlaces[i]) {
        return new ValidationResult(true, ValidationPhase.FORWARDS);
      } else if (backwardsValidPlaces[i]) {
        return new ValidationResult(true, ValidationPhase.BACKWARDS);
      } else if (flow[i]) {
        return new ValidationResult(true, ValidationPhase.FLOW);
      } else if (notValidPlaces[i]) {
        return new ValidationResult(false, ValidationPhase.FORWARDS);
      } else {
        return new ValidationResult(false, ValidationPhase.FLOW);
      }
    });
  }

  private buildTotalOrdering(): Array<Event> {
    const ordering: Array<Event> = [...this._lpo.initialEvents];
    const contained: Set<Event> = new Set<Event>(this._lpo.initialEvents);

    const examineLater: Array<Event> = [...this._lpo.events];
    while (examineLater.length > 0) {
      const e = examineLater.shift() as Event;
      if (contained.has(e)) {
        continue;
      }

      let add = true;
      for (const pre of e.previousEvents) {
        if (!contained.has(pre)) {
          add = false;
          break;
        }
      }
      if (add) {
        ordering.push(e);
        contained.add(e);
      } else {
        examineLater.push(e);
      }
    }

    return ordering;
  }

  private fireForwards(
    queue: Array<Event>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>
  ) {
    this.fire(
      queue,
      validPlaces,
      complexPlaces,
      (t) => t.ingoingArcs,
      (a) => a.source as Place,
      (t) => t.outgoingArcs,
      (a) => a.destination as Place,
      (e) => e.nextEvents
    );
  }

  private fireBackwards(
    queue: Array<Event>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>
  ) {
    this.fire(
      queue,
      validPlaces,
      complexPlaces,
      (t) => t.outgoingArcs,
      (a) => a.destination as Place,
      (t) => t.ingoingArcs,
      (a) => a.source as Place,
      (e) => e.previousEvents
    );
  }

  private fire(
    firingOrder: Array<Event>,
    validPlaces: Array<boolean>,
    complexPlaces: Array<boolean>,
    preArcs: (t: Transition) => Array<Arc>,
    prePlace: (a: Arc) => Place,
    postArcs: (t: Transition) => Array<Arc>,
    postPlace: (a: Arc) => Place,
    nextEvents: (e: Event) => Set<Event>
  ) {
    while (firingOrder.length > 0) {
      const e = firingOrder.shift() as Event;

      // can fire?
      if (e.transition !== undefined) {
        // fire
        for (const arc of preArcs(e.transition)) {
          const pIndex = this.getPIndex(prePlace(arc));
          e.localMarking![pIndex] = e.localMarking![pIndex] - arc.weight;
          if (e.localMarking![pIndex] < 0) {
            validPlaces[pIndex] = false;
          }
        }

        for (const arc of postArcs(e.transition)) {
          const pIndex = this.getPIndex(postPlace(arc));
          e.localMarking![pIndex] = e.localMarking![pIndex] + arc.weight;
        }
      }

      // push to first later and check for complex places
      if (nextEvents(e).size > 0) {
        for (let i = 0; i < this._places.length; i++) {
          if (nextEvents(e).size > 1 && e.localMarking![i] > 0) {
            complexPlaces[i] = true;
          }
          const firstLater = [...nextEvents(e)][0];
          firstLater.localMarking![i] =
            firstLater.localMarking![i] + e.localMarking![i];
        }
      }
    }
  }

  private getPIndex(p: Place) {
    return this._places.findIndex((pp) => pp === p);
  }

  private newBoolArray(fill: boolean): Array<boolean> {
    return new Array<boolean>(this._places.length).fill(fill);
  }
}

function checkFlowForPlace(place: Place, events: Array<Event>): boolean {
  const n = events.length * 2 + 2;
  const SOURCE = 0;
  const SINK = n - 1;

  const network = new MaxFlowPreflowN3(n);

  for (let eIndex = 0; eIndex < events.length; eIndex++) {
    network.setUnbounded(eventStart(eIndex), eventEnd(eIndex));

    const event = events[eIndex];
    if (event.transition === undefined) {
      if (place.marking > 0) {
        network.setCap(SOURCE, eventEnd(eIndex), place.marking);
      }
    } else {
      for (const outArc of (event.transition as unknown as Transition)
        .outgoingArcs) {
        const postPlace = outArc.destination as Place;
        if (postPlace === place) {
          network.setCap(SOURCE, eventEnd(eIndex), outArc.weight);
        }
      }
      for (const inArc of (event.transition as unknown as Transition)
        .ingoingArcs) {
        const prePlace = inArc.source as Place;
        if (prePlace === place) {
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
