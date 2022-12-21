import { Arc } from './arc';
import { EventItem } from './transition';

export interface PartialOrder {
  text: string;
  events: EventItem[];
  arcs: Arc[];

  initialEvents?: string[];
  finalEvents?: string[];
}

export function determineInitialAndFinalEvents(
  partialOrder: PartialOrder
): void {
  const initialEvents: string[] = [];
  const finalEvents: string[] = [];

  for (const e of partialOrder.events) {
    if (e.previousEvents.length === 0) {
      initialEvents.push(e.id);
    }
    if (e.nextEvents.length === 0) {
      finalEvents.push(e.id);
    }
  }

  partialOrder.initialEvents = initialEvents;
  partialOrder.finalEvents = finalEvents;
}
