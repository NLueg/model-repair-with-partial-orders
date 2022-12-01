import { ConcreteElementWithArcs } from './draggable';

export interface Place extends ConcreteElementWithArcs {
  type: 'place';
  tokens: number;
}
