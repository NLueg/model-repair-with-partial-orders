import { Arc } from './arc';

export type Draggable = {
  htmlElement: HTMLElement;
  infoElement?: HTMLElement;
  contentElement?: HTMLElement;
  incomingArcs: Array<HTMLElement>;
  outgoingArcs: Array<HTMLElement>;
};

export interface ConcreteElement {
  id: string;
  x?: number;
  y?: number;
  layerPos?: number;
}

export interface ConcreteElementWithArcs extends ConcreteElement {
  incomingArcs: Arc[];
  outgoingArcs: Arc[];
}
