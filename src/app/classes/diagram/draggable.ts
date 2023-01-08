import { Point } from '@angular/cdk/drag-drop';

import { Arc } from './arc';

export interface ConcreteElement {
  id: string;
  x?: number;
  y?: number;

  layerIndex?: number;
  layerNodes?: Array<ConcreteElement>;
  element?: SVGElement;
  dragging?: boolean;
  preDragPosition?: Point;
  svgOffset?: Point;
  lastPoint?: Point;
}

export interface ConcreteElementWithArcs extends ConcreteElement {
  incomingArcs: Arc[];
  outgoingArcs: Arc[];
}
