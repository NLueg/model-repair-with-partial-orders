import clonedeep from 'lodash.clonedeep';

import { emptyContent } from '../../../services/empty-file';
import {
  arcsAttribute,
  eventsAttribute,
  typeKey,
} from '../../../services/parser/parsing-constants';
import { Arc } from '../arc';
import { Element } from '../element';
import { Run } from '../run';
import { getCycles } from './cycles.fn';

/**
 * resolve warnings (removes duplicates and invalid arcs)
 */
export function resolveWarnings(run: Run): Run {
  removeCycles(run);

  run.text = generateTextForRun(run);
  run.warnings = [];
  return run;
}

export function generateTextForRun(run: Run): string {
  const lines = [typeKey];
  lines.push(eventsAttribute);
  run.elements.forEach((e) => {
    const identifier = e.label === e.id ? e.id : `${e.id + ' | ' + e.label}`;

    if (e.layerPos) lines.push(`${identifier} [${e.layerPos}]`);
    else lines.push(identifier);
  });

  lines.push(arcsAttribute);
  lines.push(
    ...run.arcs
      .filter((arc) => {
        const source = run.elements.find(
          (element) => element.id === arc.source
        );
        const target = run.elements.find(
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

export function removeCycles(run: Run): void {
  getCycles(run).forEach((arc) => {
    return run.arcs.splice(
      run.arcs.findIndex((a) => a === arc),
      1
    );
  });
  setRefs(run);
}

export function addElement(run: Run, element: Element): boolean {
  const contained = run.elements.some((item) => item.id == element.id);
  if (contained) {
    return false;
  }

  run.elements.push(element);
  return true;
}

export function addArc(run: Run, arc: Arc): boolean {
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
export function setRefs(run: Run): boolean {
  let check = true;
  run.elements.forEach((e) => {
    e.incomingArcs = [];
    e.outgoingArcs = [];
  });

  run.arcs.forEach((a) => {
    const source = run.elements.find((e) => e.id == a.source);
    const target = run.elements.find((e) => e.id == a.target);

    if (!source || !target) {
      check = false;
      run.arcs.slice(run.arcs.indexOf(a), 1);
    } else {
      source.outgoingArcs.push(a);
      target.incomingArcs.push(a);
    }
  });

  return check;
}

export function copyArc(arc: Arc): Arc {
  return {
    source: arc.source,
    target: arc.target,
    breakpoints: [],
    currentRun: arc.currentRun,
  };
}

export function copyElement(element: Element): Element {
  return {
    label: element.label,
    incomingArcs: [],
    outgoingArcs: [],
    id: element.id,
    currentRun: element.currentRun,
  };
}

export function copyRun(run: Run, copyCoordinates: boolean): Run {
  if (copyCoordinates) {
    return clonedeep(run);
  } else {
    const targetRun: Run = {
      text: '',
      arcs: [],
      elements: [],
      warnings: [],
    };

    run.elements.forEach((e) => {
      targetRun.elements.push(copyElement(e));
    });

    run.arcs.forEach((a) => {
      targetRun.arcs.push(copyArc(a));
    });

    setRefs(targetRun);
    generateTextForRun(targetRun);

    return targetRun;
  }
}

export function getEmptyRun(): Run {
  return {
    text: emptyContent,
    arcs: [],
    elements: [],
    warnings: [],
  };
}
