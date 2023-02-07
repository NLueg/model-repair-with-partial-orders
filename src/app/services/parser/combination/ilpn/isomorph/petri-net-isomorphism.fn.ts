import { PetriNet } from '../model/petri-net';
import { Event } from './event';
import { PartialOrder } from './partial-order';

export function arePartialOrderPetriNetsIsomorphic(
  partialOrderA: PetriNet,
  partialOrderB: PetriNet
): boolean {
  if (!compareBasicNetProperties(partialOrderA, partialOrderB)) {
    return false;
  }

  return arePartialOrdersIsomorphic(
    transform(partialOrderA),
    transform(partialOrderB)
  );
}

function compareBasicNetProperties(netA: PetriNet, netB: PetriNet): boolean {
  return (
    netA.getTransitionCount() === netB.getTransitionCount() &&
    netA.getPlaceCount() === netB.getPlaceCount() &&
    netA.getArcCount() === netB.getArcCount() &&
    netA.inputPlaces.size === netB.inputPlaces.size &&
    netA.outputPlaces.size === netB.outputPlaces.size
  );
}

class IsomorphismCandidate {
  constructor(public target: Event, public candidates: Array<Event>) {}
}

function arePartialOrdersIsomorphic(
  partialOrderA: PartialOrder,
  partialOrderB: PartialOrder
): boolean {
  partialOrderA.determineInitialAndFinalEvents();
  partialOrderB.determineInitialAndFinalEvents();

  const unsolved: Array<IsomorphismCandidate> = [];
  for (const initialEvent of partialOrderA.initialEvents) {
    unsolved.push(
      new IsomorphismCandidate(
        initialEvent,
        Array.from(partialOrderB.initialEvents)
      )
    );
  }

  const mappingAB = new Map<string, Event>();
  const mappingBA = new Map<string, Event>();
  const pushedToBack = new Set<IsomorphismCandidate>();
  while (unsolved.length > 0) {
    const problem = unsolved.shift()!;
    if (mappingAB.has(problem.target.id)) {
      continue;
    }

    const previous: Array<Event> = Array.from(problem.target.previousEvents);
    if (previous.some((p) => !mappingAB.has(p.id))) {
      // pre-set was not yet determined, we have to wait
      if (pushedToBack.has(problem)) {
        return false;
      }
      pushedToBack.add(problem);
      unsolved.push(problem);
      continue;
    }
    problem.candidates = problem.candidates.filter((c) => !mappingBA.has(c.id));

    const match = problem.candidates.find((c) => {
      const sameLabel = c.label === problem.target.label;
      if (!sameLabel) {
        return false;
      }
      if (c.previousEvents.size !== problem.target.previousEvents.size) {
        return false;
      }
      if (c.nextEvents.size !== problem.target.nextEvents.size) {
        return false;
      }
      const previousLabels = new Set(
        Array.from(c.previousEvents).map((p) => p.label!)
      );
      for (const p of problem.target.previousEvents) {
        if (!previousLabels.has(p.label!)) {
          return false;
        }
        previousLabels.delete(p.label!);
      }
      return true;
    });
    if (match === undefined) {
      return false;
    }

    pushedToBack.clear();

    mappingAB.set(problem.target.id, match);
    mappingBA.set(match.id, problem.target);

    for (const next of problem.target.nextEvents) {
      unsolved.push(
        new IsomorphismCandidate(next, Array.from(match.nextEvents))
      );
    }
  }

  return true;
}

function transform(net: PetriNet): PartialOrder {
  const badPlace = net
    .getPlaces()
    .find(
      (p) =>
        p.ingoingArcs.length > 1 ||
        p.outgoingArcs.length > 1 ||
        (p.ingoingArcs.length === 1 &&
          p.outgoingArcs.length === 1 &&
          p.ingoingArcs[0].sourceId === p.outgoingArcs[0].destinationId)
    );
  if (badPlace !== undefined) {
    throw new Error(
      `The given Petri net is not a partial order! The place with id '${badPlace.id}' has too many in-/outgoing arcs or is part of a self-loop.`
    );
  }
  const badTransition = net
    .getTransitions()
    .find(
      (t) =>
        t.ingoingArcs.length === 0 ||
        t.outgoingArcs.length === 0 ||
        t.label === undefined
    );
  if (badTransition !== undefined) {
    throw new Error(
      `The given Petri net is not a partial order! The transition with id '${badTransition.id}' has an empty pre-/post-set or is unlabeled`
    );
  }

  const result = new PartialOrder();
  for (const t of net.getTransitions()) {
    result.addEvent(new Event(t.id!, t.label));
  }
  for (const t of net.getTransitions()) {
    const event = result.getEvent(t.id!)!;
    for (const arc of t.outgoingArcs) {
      const nextTransitionId = arc.destination.outgoingArcs[0]?.destinationId;
      if (nextTransitionId !== undefined) {
        event.addNextEvent(result.getEvent(nextTransitionId)!);
      }
    }
  }

  return result;
}
