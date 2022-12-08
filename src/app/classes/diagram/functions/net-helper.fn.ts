import clonedeep from 'lodash.clonedeep';

import { emptyContent } from '../../../services/empty-file';
import {
  arcsAttribute,
  netTypeKey,
  transitionsAttribute,
} from '../../../services/parser/parsing-constants';
import { Arc } from '../arc';
import { ConcreteElementWithArcs } from '../draggable';
import { PartialOrder } from '../partial-order';
import { PetriNet } from '../petri-net';
import { Place } from '../place';
import { EventItem, Transition } from '../transition';
import { getCycles } from './cycles.fn';

export function generateTextForRun(run: PetriNet): string {
  const lines = [netTypeKey];
  lines.push(transitionsAttribute);
  run.transitions.forEach((e) => {
    const identifier = e.label === e.id ? e.id : `${e.id + ' | ' + e.label}`;

    if (e.layerPos) lines.push(`${identifier} [${e.layerPos}]`);
    else lines.push(identifier);
  });

  lines.push(arcsAttribute);
  lines.push(
    ...run.arcs
      .filter((arc) => {
        const source = run.transitions.find(
          (element) => element.id === arc.source
        );
        const target = run.transitions.find(
          (element) => element.id === arc.target
        );
        return source && target;
      })
      .map((arc) => arc.source + ' ' + arc.target + getBreakpointInfo(arc))
  );
  return lines.join('\n');
}

function getBreakpointInfo(arc: Arc): string {
  let text = '';
  if (arc.breakpoints.length > 0) {
    text = '';
    arc.breakpoints.forEach((breakpoint) => {
      text += `[${breakpoint.layerPos}]`;
    });
  }

  return text;
}

export function removeCycles(run: PetriNet): void {
  getCycles(run).forEach((arc) => {
    return run.arcs.splice(
      run.arcs.findIndex((a) => a === arc),
      1
    );
  });
  setRefs(run);
}

export function addTransition(
  petriNet: PetriNet,
  element: Transition
): boolean {
  const contained = petriNet.transitions.some((item) => item.id == element.id);
  if (contained) {
    return false;
  }

  petriNet.transitions.push(element);
  return true;
}

export function addEventItem(
  partialOrder: PartialOrder,
  element: EventItem
): boolean {
  const contained = partialOrder.events.some((item) => item.id == element.id);
  if (contained) {
    return false;
  }

  partialOrder.events.push(element);
  return true;
}

export function addPlace(petriNet: PetriNet, place: Place): boolean {
  const contained = petriNet.places.some((item) => item.id == place.id);
  if (contained) {
    return false;
  }

  petriNet.places.push(place);
  return true;
}

export function addArc(run: PetriNet | PartialOrder, arc: Arc): boolean {
  const contained = run.arcs.some(
    (item) => item.source == arc.source && item.target == arc.target
  );
  if (contained) {
    return false;
  }

  run.arcs.push(arc);
  return true;
}

/**
 * set references from arcs to transitions and vice versa
 * @returns all references found?
 */
export function setRefs(net: PetriNet): boolean {
  let check = true;
  const concreteElements: ConcreteElementWithArcs[] = getElementsWithArcs(net);
  concreteElements.forEach((e) => {
    e.incomingArcs = [];
    e.outgoingArcs = [];
  });

  net.arcs.forEach((a) => {
    const source = concreteElements.find((e) => e.id == a.source);
    const target = concreteElements.find((e) => e.id == a.target);

    if (!source || !target) {
      check = false;
      net.arcs.slice(net.arcs.indexOf(a), 1);
    } else {
      source.outgoingArcs.push(a);
      target.incomingArcs.push(a);
    }
  });

  return check;
}

export function copyArc(arc: Arc): Arc {
  return {
    weight: arc.weight,
    source: arc.source,
    target: arc.target,
    breakpoints: [],
    currentRun: arc.currentRun,
  };
}

export function copyElement(element: Transition): Transition {
  return {
    label: element.label,
    incomingArcs: [],
    outgoingArcs: [],
    id: element.id,
    type: 'transition',
  };
}

export function copyRun(run: PetriNet, copyCoordinates: boolean): PetriNet {
  if (copyCoordinates) {
    return clonedeep(run);
  } else {
    const targetRun: PetriNet = {
      text: '',
      transitions: [],
      arcs: [],
      places: [],
    };

    run.transitions.forEach((e) => {
      targetRun.transitions.push(copyElement(e));
    });

    run.arcs.forEach((a) => {
      targetRun.arcs.push(copyArc(a));
    });

    setRefs(targetRun);
    generateTextForRun(targetRun);

    return targetRun;
  }
}

export function getEmptyNet(): PetriNet {
  return {
    text: emptyContent,
    transitions: [],
    places: [],
    arcs: [],
  };
}

export function getElementsWithArcs(net: PetriNet): (Transition | Place)[] {
  return [...net.transitions, ...net.places];
}
