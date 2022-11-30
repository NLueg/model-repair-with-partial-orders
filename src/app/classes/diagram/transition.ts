import { ConcreteElementWithArcs } from './draggable';

export interface Transition extends ConcreteElementWithArcs {
  label: string;
  id: string;
}
