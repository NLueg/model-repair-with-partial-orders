import { ElementRef } from '@angular/core';

import { Coordinates } from '../../../classes/diagram/coordinates';
import { Draggable } from '../../../classes/diagram/draggable';
import { eventIdAttribute, eventSize } from '../../svg/svg-constants';
import { asInt, getXAttribute, getYAttribute } from '../dragging-helper.fn';
import { FindElementsService } from '../find/find-elements.service';

export class DraggingCreationService {
  public static createDraggableFromElement(
    element: HTMLElement,
    drawingArea: ElementRef<SVGElement> | undefined
  ): Draggable | null {
    if (
      !drawingArea ||
      (element.nodeName !== 'rect' && element.nodeName !== 'circle')
    ) {
      return null;
    }
    const draggable = {
      event: element,
    } as Draggable;
    draggable.infoElement =
      DraggingCreationService.findInfoElementForTransition(
        element,
        drawingArea
      );
    draggable.incomingArcs = DraggingCreationService.findIncomingArcs(
      element,
      drawingArea
    );
    draggable.outgoingArcs = DraggingCreationService.findOutgoingArcs(
      element,
      drawingArea
    );
    return draggable;
  }

  static findInfoElementForTransition(
    event: HTMLElement,
    drawingArea: ElementRef<SVGElement>
  ): HTMLElement {
    const selector =
      'foreignObject[describes-event="' +
        event.getAttribute(eventIdAttribute) ?? '' + '"]';
    return FindElementsService.getElementFromCanvas(selector, drawingArea);
  }

  private static createCoordsFromElement(element: HTMLElement): Coordinates {
    return {
      x: asInt(element, getXAttribute(element)),
      y: asInt(element, getYAttribute(element)),
    };
  }

  private static findIncomingArcs(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
  ): Array<HTMLElement> {
    const coords = DraggingCreationService.createCoordsFromElement(transition);
    const nodes = FindElementsService.getAllElementsFromCanvas(
      '*',
      drawingArea
    );
    const incomingLines = [];
    for (let i = 0; i < nodes.length; i++) {
      const c: Coordinates = {
        x: asInt(nodes[i], 'x2'),
        y: asInt(nodes[i], 'y2'),
      };

      //Check if line intersects the current element bounds
      if (
        (transition.nodeName === 'rect' &&
          c.y >= coords.y &&
          c.y <= coords.y + eventSize &&
          c.x >= coords.x &&
          c.x <= coords.x + eventSize / 2) ||
        (c.y == coords.y && c.x == coords.x)
      ) {
        incomingLines.push(nodes[i] as HTMLElement);
      }
    }
    return incomingLines;
  }

  private static findOutgoingArcs(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
  ): Array<HTMLElement> {
    const coords = FindElementsService.createCoordsFromElement(transition);
    const nodes = FindElementsService.getAllElementsFromCanvas(
      '*',
      drawingArea
    );
    const outgoingLines = [];
    for (let i = 0; i < nodes.length; i++) {
      const c: Coordinates = {
        x: asInt(nodes[i], 'x1'),
        y: asInt(nodes[i], 'y1'),
      };

      //Check if line intersects the current element bounds
      if (
        (transition.nodeName === 'rect' &&
          c.y >= coords.y &&
          c.y <= coords.y + eventSize &&
          c.x >= coords.x + eventSize / 2 &&
          c.x <= coords.x + eventSize) ||
        (c.x == coords.x && c.y == coords.y)
      ) {
        outgoingLines.push(nodes[i] as HTMLElement);
      }
    }
    return outgoingLines;
  }
}
