import { ElementRef } from '@angular/core';

import { Coordinates } from '../../../classes/diagram/coordinates';
import { eventSize } from '../../svg/svg-constants';
import { asInt, getXAttribute, getYAttribute } from '../dragging-helper.fn';

export class FindElementsService {
  static getElementFromCanvas(
    selector: string,
    drawingArea: ElementRef<SVGElement>
  ): HTMLElement {
    return drawingArea.nativeElement.querySelector(selector) as HTMLElement;
  }

  static getAllElementsFromCanvas(
    selector: string,
    drawingArea?: ElementRef<SVGElement>
  ): NodeListOf<Element> {
    return drawingArea?.nativeElement.querySelectorAll(
      selector
    ) as NodeListOf<Element>;
  }

  static createCoordsFromElement(element: HTMLElement): Coordinates {
    return {
      x: asInt(element, getXAttribute(element)),
      y: asInt(element, getYAttribute(element)),
    };
  }

  static findElementsInYAxis(
    element: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
  ): NodeListOf<Element> {
    let relevantXCircle = 0;
    let relevantXRect = 0;
    if (element.nodeName === 'circle') {
      relevantXCircle = asInt(element, 'cx');
      relevantXRect = +relevantXCircle - eventSize / 2;
    }
    if (element.nodeName === 'rect') {
      relevantXRect = asInt(element, 'x');
      relevantXCircle = relevantXRect + eventSize / 2;
    }
    const rectSelector = 'rect[x="' + relevantXRect + '"]';
    const circleSelector = 'circle[cx="' + relevantXCircle + '"]';
    return FindElementsService.getAllElementsFromCanvas(
      circleSelector + ',' + rectSelector,
      drawingArea
    );
  }
}
