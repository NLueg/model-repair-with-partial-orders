import { Arc } from './arc';
import { Place } from './place';
import { Transition } from './transition';

export interface PetriNet {
  transitions: Transition[];
  places: Place[];
  arcs: Arc[];
}

export function isRunEmpty(run: PetriNet): boolean {
  return run.arcs.length === 0 && run.transitions.length === 0;
}
