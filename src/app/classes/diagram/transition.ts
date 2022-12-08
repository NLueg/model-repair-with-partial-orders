import { ConcreteElementWithArcs } from './draggable';

export interface Transition extends ConcreteElementWithArcs {
  type: 'transition';
  label: string;
}

export interface EventItem extends ConcreteElementWithArcs {
  type: 'event';
  label: string;

  nextEvents: string[];
  previousEvents: string[];

  // Required for firing the partial order
  localMarking?: number[];
  transition?: Transition;
}

export function concatEvents(first: EventItem, second: EventItem): void {
  first.nextEvents.push(second.id);
  second.previousEvents.push(first.id);
}
