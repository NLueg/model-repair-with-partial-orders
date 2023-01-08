import { Point } from '@angular/cdk/drag-drop';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ConcreteElement } from '../../classes/diagram/draggable';
import { PetriNet } from '../../classes/diagram/petri-net';

export function bindEventsForNet(
  net: PetriNet,
  mouseMoved$: Observable<MouseEvent>,
  mouseUp$: Observable<MouseEvent>,
  redrawRequest$: Subject<void>,
  kill$: Observable<void>
): void {
  net.places.forEach((v) =>
    bindEventsForConcreteElement(
      v,
      mouseMoved$,
      mouseUp$,
      kill$,
      redrawRequest$
    )
  );
  net.transitions.forEach((v) =>
    bindEventsForConcreteElement(
      v,
      mouseMoved$,
      mouseUp$,
      kill$,
      redrawRequest$
    )
  );
  net.arcs.forEach((arc) =>
    arc.breakpoints.forEach((v) =>
      bindEventsForConcreteElement(
        v,
        mouseMoved$,
        mouseUp$,
        kill$,
        redrawRequest$
      )
    )
  );
}

function bindEventsForConcreteElement(
  v: ConcreteElement,
  mouseMoved$: Observable<MouseEvent>,
  mouseUp$: Observable<MouseEvent>,
  kill$: Observable<void>,
  redrawRequest$: Subject<void>
): void {
  mouseMoved$
    .pipe(takeUntil(kill$))
    .subscribe((e) =>
      processMouseMovedForConcreteElement(v, e, redrawRequest$)
    );
  mouseUp$
    .pipe(takeUntil(kill$))
    .subscribe(() => processMouseUpForConcreteElement(v, redrawRequest$));
}

function processMouseUpForConcreteElement(
  element: ConcreteElement,
  redrawRequest$: Subject<void>
): void {
  if (element.element === undefined || !element.dragging) {
    return;
  }

  element.dragging = false;
  element.lastPoint = undefined;
  element.x = element.preDragPosition?.x;
  element.y = element.preDragPosition?.y;
  updateSvgForConcreteElement(element);

  redrawRequest$.next(undefined);
}

function processMouseMovedForConcreteElement(
  element: ConcreteElement,
  event: MouseEvent,
  redrawRequest$: Subject<void>
): void {
  if (
    !element.dragging ||
    element.element === undefined ||
    element.lastPoint === undefined
  ) {
    return;
  }

  if (!element.y) {
    element.y = 0;
  }
  element.y += (event.y ?? 0) - (element.lastPoint.y ?? 0);
  element.lastPoint.x = event.x;
  element.lastPoint.y = event.y;
  updateSvgForConcreteElement(element);

  if (element.layerNodes === undefined || element.layerIndex === undefined) {
    redrawRequest$.next();
    return;
  }
  const step = Math.sign((element.y ?? 0) - (element.preDragPosition?.y ?? 0));
  if (step === 0) {
    redrawRequest$.next();
    return;
  }
  const neighbourIndex = element.layerIndex + step;
  if (neighbourIndex < 0 || neighbourIndex >= element.layerNodes.length) {
    redrawRequest$.next();
    return;
  }
  if (
    (step < 0 &&
      (element.y ?? 0) < (element.layerNodes[neighbourIndex].y ?? 0)) ||
    (step > 0 && (element.y ?? 0) > (element.layerNodes[neighbourIndex].y ?? 0))
  ) {
    swap(element, neighbourIndex);
  }
  redrawRequest$.next();
}

function updateSvgForConcreteElement(
  element: ConcreteElement,
  offset?: Point
): void {
  if (
    element.element === undefined ||
    (element.svgOffset === undefined && offset === undefined)
  ) {
    return;
  }

  const off = offset ?? element.svgOffset;
  element.element.setAttribute(
    getXAttrName(element),
    '' + ((element.x ?? 0) + (off as Point).x)
  );
  element.element.setAttribute(
    getYAttrName(element),
    '' + ((element.y ?? 0) + (off as Point).y)
  );
}

function swap(element: ConcreteElement, newIndex: number) {
  if (element.layerNodes === undefined || element.layerIndex === undefined) {
    return;
  }

  const neighbour = element.layerNodes[newIndex];
  const neighbourPos = { x: neighbour.x ?? 0, y: neighbour.y ?? 0 };
  const offset = getSvgOffset(neighbour);

  neighbour.x = element.preDragPosition?.x ?? 0;
  neighbour.y = element.preDragPosition?.y ?? 0;
  element.preDragPosition = neighbourPos;

  element.layerNodes[element.layerIndex] = neighbour;
  element.layerNodes[newIndex] = element;
  neighbour.layerIndex = element.layerIndex;
  element.layerIndex = newIndex;

  updateSvgForConcreteElement(neighbour, offset);
}

export function getSvgOffset(element: ConcreteElement): Point {
  if (element.element === undefined) {
    throw new Error('Element not set. SVG offset cannot be computed!');
  }
  return {
    x:
      parseInt(element.element.getAttribute(getXAttrName(element)) ?? '0') -
      (element.x ?? 0),
    y:
      parseInt(element.element.getAttribute(getYAttrName(element)) ?? '0') -
      (element.y ?? 0),
  };
}

function getXAttrName(element: ConcreteElement): string {
  return element.element?.tagName === 'circle' ? 'cx' : 'x';
}

function getYAttrName(element: ConcreteElement): string {
  return element.element?.tagName === 'circle' ? 'cy' : 'y';
}
