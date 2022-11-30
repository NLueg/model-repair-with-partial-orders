import { Arc } from './arc';

export type Draggable = {
  event: HTMLElement;
  infoElement?: HTMLElement;
  incomingArcs: Array<HTMLElement>;
  outgoingArcs: Array<HTMLElement>;
};

export interface ConcreteElement {
  x?: number;
  y?: number;
  layerPos?: number;
}

export interface ConcreteElementWithArcs extends ConcreteElement {
  incomingArcs: Arc[];
  outgoingArcs: Arc[];
}
