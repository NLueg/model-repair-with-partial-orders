import { Arc } from './arc';
import { EventItem } from './transition';

export interface EventLog {
  text: string;
  events: EventItem[];
  arcs: Arc[];
}
