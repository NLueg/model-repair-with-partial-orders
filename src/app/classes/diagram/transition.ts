import { ConcreteElementWithArcs } from './draggable';

export interface Transition extends ConcreteElementWithArcs {
  type: 'transition';
  label: string;
}

export interface EventItem extends ConcreteElementWithArcs {
  type: 'event';
  label: string;
  transition?: Transition;
}
