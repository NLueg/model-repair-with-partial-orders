import { ElementRef } from '@angular/core';

import { Coordinates } from '../../../classes/diagram/coordinates';
import { Draggable } from '../../../classes/diagram/draggable';
import { eventSize, idAttribute } from '../../svg/svg-constants';
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
      htmlElement: element,
    } as Draggable;
    draggable.infoElement =
      DraggingCreationService.findInfoElementForTransition(
        element,
        drawingArea
      );
    if (element.nodeName === 'circle') {
      draggable.contentElement = DraggingCreationService.findContentOfForPlace(
        element,
        drawingArea
      );
    }
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
      'text[describes="' + event.getAttribute(idAttribute) ?? '' + '"]';
    return FindElementsService.getElementFromCanvas(selector, drawingArea);
  }

  static findContentOfForPlace(
    event: HTMLElement,
    drawingArea: ElementRef<SVGElement>
  ): HTMLElement {
    const selector =
      'text[content-of="' + event.getAttribute(idAttribute) ?? '' + '"]';
    return FindElementsService.getElementFromCanvas(selector, drawingArea);
  }

  private static createCoordsFromElement(element: HTMLElement): Coordinates {
    const additonalOffset = element.nodeName === 'circle' ? eventSize / 2 : 0;
    return {
      x: asInt(element, getXAttribute(element)) - additonalOffset,
      y: asInt(element, getYAttribute(element)) - additonalOffset,
    };
  }

  private static findIncomingArcs(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
  ): Array<HTMLElement> {
    const elementCoordinate =
      DraggingCreationService.createCoordsFromElement(transition);
    const nodes = FindElementsService.getAllElementsFromCanvas(
      '*',
      drawingArea
    );
    const incomingLines = [];
    for (let i = 0; i < nodes.length; i++) {
      const lineCoordinate: Coordinates = {
        x: asInt(nodes[i], 'x2'),
        y: asInt(nodes[i], 'y2'),
      };

      //Check if line intersects the current element bounds
      if (
        (lineCoordinate.y >= elementCoordinate.y &&
          lineCoordinate.y <= elementCoordinate.y + eventSize &&
          lineCoordinate.x >= elementCoordinate.x &&
          lineCoordinate.x <= elementCoordinate.x + eventSize / 2) ||
        (lineCoordinate.y == elementCoordinate.y &&
          lineCoordinate.x == elementCoordinate.x)
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
        (c.y >= coords.y &&
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
