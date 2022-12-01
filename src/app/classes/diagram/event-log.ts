import { Arc } from './arc';
import { Transition } from './transition';

export interface EventLog {
  text: string;
  transitions: Transition[];
  arcs: Arc[];
}
