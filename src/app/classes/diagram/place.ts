import { ConcreteElementWithArcs } from './draggable';

export interface Place extends ConcreteElementWithArcs {
  id: string;
  tokens: number;
}
