import { Injectable } from '@angular/core';

import {
  Arc,
  Breakpoint,
  doesArcBelongToCurrentRun,
} from '../../classes/diagram/arc';
import { Coordinates } from '../../classes/diagram/coordinates';
import { Element } from '../../classes/diagram/element';
import { getIntersection } from '../../classes/diagram/functions/display.fn';
import { PetriNet } from '../../classes/diagram/petriNet';
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
  public createSvgElements(run: PetriNet, merge: boolean): Array<SVGElement> {
    const result: Array<SVGElement> = [];
    const offset = run.offset ?? { x: 0, y: 0 };

    run.arcs.forEach((arc) => {
      const source = run.elements.find((el) => el.id === arc.source);
      const target = run.elements.find((el) => el.id === arc.target);
      const arrow = createSvgForArc(arc, source, target, merge, offset);
      if (arrow) {
        arrow.forEach((a) => {
          result.push(a);
        });
      }
    });
    run.elements.forEach((el) => {
      result.push(...createSvgForElement(el, merge, offset));
    });
    return result;
  }
}

function createSvgForElement(
  element: Element,
  highlight: boolean,
  offset: Coordinates
): SVGElement[] {
  const svg = createSvgElement('rect');
  const x = (element.x ?? 0) + offset.x;
  const y = (element.y ?? 0) + offset.y;
  svg.setAttribute('x', `${x}`);
  svg.setAttribute('y', `${y}`);
  svg.setAttribute('width', `${eventSize}`);
  svg.setAttribute('height', `${eventSize}`);
  svg.setAttribute('stroke', 'black');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('fill-opacity', '0');
  svg.setAttribute(layerPosYAttibute, `${element.layerPos ?? 0}`);
  svg.setAttribute(eventIdAttribute, `${element.id}`);

  const text = createSvgElement('foreignObject');
  text.setAttribute('x', `${x - (100 - eventSize) / 2}`);
  text.setAttribute('y', `${y + eventSize + 2}`);
  const height = 40;
  const width = 100;
  text.setAttribute('height', `${height}`);
  text.setAttribute('width', `${width}`);
  text.setAttribute('describes-event', element.id);
  const span = document.createElement('span');
  span.setAttribute('title', element.label);
  span.textContent = element.label;
  text.append(span);

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
  source: Element | undefined,
  target: Element | undefined,
  highlight: boolean,
  offset: Coordinates
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
          x: start.x + offset.x,
          y: start.y + offset.y,
        },
        {
          x: end.x + offset.x,
          y: end.y + offset.y,
        },
        arc,
        {
          highlight: highlight && doesArcBelongToCurrentRun(arc),
          showArrow: true,
          hasFromAttribute: true,
          hasToAttribute: true,
        }
      )
    );
  } else {
    //source -> first breakpoint
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
          x: start.x + offset.x,
          y: start.y + offset.y,
        },
        {
          x: arc.breakpoints[0].x + eventSize / 2 + offset.x,
          y: arc.breakpoints[0].y + eventSize / 2 + offset.y,
        },
        arc,
        {
          highlight: highlight && doesArcBelongToCurrentRun(arc),
          showArrow: false,
          hasFromAttribute: true,
        }
      )
    );
    //breakpoint -> next breakpoint
    for (let i = 0; i < arc.breakpoints.length - 1; i++) {
      elements.push(
        createLine(
          {
            x: arc.breakpoints[i].x + eventSize / 2 + offset.x,
            y: arc.breakpoints[i].y + eventSize / 2 + offset.y,
          },
          {
            x: arc.breakpoints[i + 1].x + eventSize / 2 + offset.x,
            y: arc.breakpoints[i + 1].y + eventSize / 2 + offset.y,
          },
          arc,
          {
            highlight: highlight && doesArcBelongToCurrentRun(arc),
            showArrow: false,
          }
        )
      );
    }
    //last breakpoint -> target
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
          x:
            arc.breakpoints[arc.breakpoints.length - 1].x +
            eventSize / 2 +
            offset.x,
          y:
            arc.breakpoints[arc.breakpoints.length - 1].y +
            eventSize / 2 +
            offset.y,
        },
        {
          x: end.x + offset.x,
          y: end.y + offset.y,
        },
        arc,
        {
          highlight: highlight && doesArcBelongToCurrentRun(arc),
          showArrow: true,
          hasToAttribute: true,
        }
      )
    );
    elements.push(
      createCircle(arc.breakpoints, 0, source.id, target.id, offset)
    );
    for (let i = 0; i < arc.breakpoints.length - 1; i++) {
      elements.push(
        createCircle(arc.breakpoints, i + 1, source.id, target.id, offset)
      );
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
  if (displayInfo.highlight) {
    // TODO: Change color like this!
    // line.setAttribute('stroke', highlightColor);
  } else {
    line.setAttribute('stroke', 'black');
  }
  line.setAttribute('stroke-width', '1');
  if (displayInfo.hasFromAttribute) {
    line.setAttribute(fromTransitionAttribute, arc.source);
  }
  if (displayInfo.hasToAttribute) {
    line.setAttribute(toTransitionAttribute, arc.target);
  }
  if (displayInfo.showArrow) {
    if (displayInfo.highlight) {
      line.setAttribute('marker-end', 'url(#arrowheadhightlight )');
    } else {
      line.setAttribute('marker-end', 'url(#arrowhead)');
    }
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
  targetLabel: string,
  offset: Coordinates
): SVGElement {
  const breakpoint = breakpoints[positionInRun];
  const x = breakpoint.x + eventSize / 2 + offset.x;
  const y = breakpoint.y + eventSize / 2 + offset.y;
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
  highlight: boolean;
  showArrow: boolean;
  hasFromAttribute?: boolean;
  hasToAttribute?: boolean;
};
