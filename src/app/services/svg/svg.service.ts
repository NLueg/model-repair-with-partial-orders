import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../../classes/diagram/arc';
import { Coordinates } from '../../classes/diagram/coordinates';
import { ConcreteElementWithArcs } from '../../classes/diagram/draggable';
import { getIntersection } from '../../classes/diagram/functions/display.fn';
import { getElementsWithArcs } from '../../classes/diagram/functions/net-helper.fn';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { Transition } from '../../classes/diagram/transition';
import {
  breakpointPositionAttribute,
  breakpointTrail,
  circleSize,
  eventIdAttribute,
  eventSize,
  fromTransitionAttribute,
  layerPosYAttibute,
  toTransitionAttribute,
} from './svg-constants';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  public createSvgElements(run: PetriNet): Array<SVGElement> {
    const result: Array<SVGElement> = [];

    const elements: (Transition | Place)[] = getElementsWithArcs(run);

    run.arcs.forEach((arc) => {
      const source = elements.find((el) => el.id === arc.source);
      const target = elements.find((el) => el.id === arc.target);
      const arrow = createSvgForArc(arc, source, target);
      if (arrow) {
        arrow.forEach((a) => {
          result.push(a);
        });
      }
    });
    elements.forEach((el) => {
      result.push(...createSvgForElement(el));
    });
    return result;
  }
}

function createSvgForElement(element: Transition | Place): SVGElement[] {
  const x = element.x ?? 0;
  const y = element.y ?? 0;

  const text = createSvgElement('foreignObject');
  text.setAttribute('x', `${x - (100 - eventSize) / 2}`);
  text.setAttribute('y', `${y + eventSize + 2}`);
  const height = 40;
  const width = 100;
  text.setAttribute('height', `${height}`);
  text.setAttribute('width', `${width}`);
  text.setAttribute('describes-event', element.id);
  const span = document.createElement('span');

  let svg: SVGElement;

  if (element.type === 'transition') {
    svg = createSvgElement('rect');
    svg.setAttribute('x', `${x}`);
    svg.setAttribute('y', `${y}`);
    svg.setAttribute('width', `${eventSize}`);
    svg.setAttribute('height', `${eventSize}`);
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');
    svg.setAttribute(layerPosYAttibute, `${element.layerPos ?? 0}`);
    svg.setAttribute(eventIdAttribute, `${element.id}`);

    span.setAttribute('title', element.label);
    span.textContent = element.label;
  } else {
    const radius = eventSize / 2;

    svg = createSvgElement('circle');
    svg.setAttribute('cx', `${x + radius}`);
    svg.setAttribute('cy', `${y + radius}`);
    svg.setAttribute('r', `${radius}`);
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');
    svg.setAttribute(layerPosYAttibute, `${element.layerPos ?? 0}`);
    svg.setAttribute(eventIdAttribute, `${element.id}`);

    span.setAttribute('title', element.id);
    span.textContent = element.id;
  }

  text.append(span);

  // TODO: Specific layout for places

  // TODO: This is how colors are changed!
  /* if (doesElementBelongToCurrentRun(element) && highlight) {
    svg.setAttribute('stroke', highlightColor);
    text.setAttribute('style', `color: ${highlightColor};`);
  }*/

  return [svg, text];
}

function createSvgElement(name: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createSvgForArc(
  arc: Arc,
  source: ConcreteElementWithArcs | undefined,
  target: ConcreteElementWithArcs | undefined
): SVGElement[] {
  const elements: SVGElement[] = [];

  if (!source || !target) {
    return elements;
  }

  if (arc.breakpoints.length == 0) {
    const start = getIntersection(
      (source.x ?? 0) + eventSize / 2,
      (source.y ?? 0) + eventSize / 2,
      (target.x ?? 0) + eventSize / 2,
      (target.y ?? 0) + eventSize / 2,
      false
    );
    const end = getIntersection(
      (target.x ?? 0) + eventSize / 2,
      (target.y ?? 0) + eventSize / 2,
      (source.x ?? 0) + eventSize / 2,
      (source.y ?? 0) + eventSize / 2,
      true
    );
    elements.push(
      createLine(
        {
          x: start.x,
          y: start.y,
        },
        {
          x: end.x,
          y: end.y,
        },
        arc,
        {
          showArrow: true,
          hasFromAttribute: true,
          hasToAttribute: true,
        }
      )
    );
  } else {
    // source -> first breakpoint
    const start = getIntersection(
      (source.x ?? 0) + eventSize / 2,
      (source.y ?? 0) + eventSize / 2,
      arc.breakpoints[0].x + eventSize / 2,
      arc.breakpoints[0].y + eventSize / 2,
      false
    );
    elements.push(
      createLine(
        {
          x: start.x,
          y: start.y,
        },
        {
          x: arc.breakpoints[0].x + eventSize / 2,
          y: arc.breakpoints[0].y + eventSize / 2,
        },
        arc,
        {
          showArrow: false,
          hasFromAttribute: true,
        }
      )
    );
    // breakpoint -> next breakpoint
    for (let i = 0; i < arc.breakpoints.length - 1; i++) {
      elements.push(
        createLine(
          {
            x: arc.breakpoints[i].x + eventSize / 2,
            y: arc.breakpoints[i].y + eventSize / 2,
          },
          {
            x: arc.breakpoints[i + 1].x + eventSize / 2,
            y: arc.breakpoints[i + 1].y + eventSize / 2,
          },
          arc,
          {
            showArrow: false,
          }
        )
      );
    }
    // last breakpoint -> target
    const end = getIntersection(
      (target.x ?? 0) + eventSize / 2,
      (target.y ?? 0) + eventSize / 2,
      arc.breakpoints[arc.breakpoints.length - 1].x + eventSize / 2,
      arc.breakpoints[arc.breakpoints.length - 1].y + eventSize / 2,
      true
    );
    elements.push(
      createLine(
        {
          x: arc.breakpoints[arc.breakpoints.length - 1].x + eventSize / 2,
          y: arc.breakpoints[arc.breakpoints.length - 1].y + eventSize / 2,
        },
        {
          x: end.x,
          y: end.y,
        },
        arc,
        {
          showArrow: true,
          hasToAttribute: true,
        }
      )
    );
    elements.push(createCircle(arc.breakpoints, 0, source.id, target.id));
    for (let i = 0; i < arc.breakpoints.length - 1; i++) {
      elements.push(createCircle(arc.breakpoints, i + 1, source.id, target.id));
    }
  }

  return elements;
}

function createLine(
  fromCoords: Coordinates,
  toCoords: Coordinates,
  arc: Arc,
  displayInfo: ArcDisplayInfo
): SVGElement {
  const line = createSvgElement('line');
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '1');
  if (displayInfo.hasFromAttribute) {
    line.setAttribute(fromTransitionAttribute, arc.source);
  }
  if (displayInfo.hasToAttribute) {
    line.setAttribute(toTransitionAttribute, arc.target);
  }
  if (displayInfo.showArrow) {
    line.setAttribute('marker-end', 'url(#arrowhead)');
  }
  line.setAttribute('x1', `${fromCoords.x}`);
  line.setAttribute('y1', `${fromCoords.y}`);
  line.setAttribute('x2', `${toCoords.x}`);
  line.setAttribute('y2', `${toCoords.y}`);
  return line;
}

function createCircle(
  breakpoints: Array<Breakpoint>,
  positionInRun: number,
  sourceLabel: string,
  targetLabel: string
): SVGElement {
  const breakpoint = breakpoints[positionInRun];
  const x = breakpoint.x + eventSize / 2;
  const y = breakpoint.y + eventSize / 2;
  const circle = createSvgElement('circle');
  circle.setAttribute('r', `${circleSize}`);
  circle.setAttribute('cx', `${x}`);
  circle.setAttribute('cy', `${y}`);
  circle.setAttribute('class', `move-helper`);
  circle.setAttribute(layerPosYAttibute, `${breakpoint.layerPos}` ?? '');
  circle.setAttribute(breakpointPositionAttribute, `${positionInRun}` ?? '');
  circle.setAttribute(fromTransitionAttribute, sourceLabel);
  circle.setAttribute(toTransitionAttribute, targetLabel);
  let trail = '';
  for (let i = 0; i < breakpoints.length; i++) {
    trail += i.toString() + ':' + breakpoints[i].layerPos?.toString() ?? '';
    if (i < breakpoints.length - 1) {
      trail += ',';
    }
  }
  circle.setAttribute(breakpointTrail, trail);
  return circle;
}

type ArcDisplayInfo = {
  showArrow: boolean;
  hasFromAttribute?: boolean;
  hasToAttribute?: boolean;
};
