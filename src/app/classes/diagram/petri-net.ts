import { Arc } from './arc';
import { Place } from './place';
import { Transition } from './transition';

export interface PetriNet {
  transitions: Transition[];
  places: Place[];
  arcs: Arc[];
}

export function isNetEmpty(petriNet: PetriNet): boolean {
  return (
    petriNet.arcs.length === 0 &&
    petriNet.places.length === 0 &&
    petriNet.transitions.length === 0
  );
}
