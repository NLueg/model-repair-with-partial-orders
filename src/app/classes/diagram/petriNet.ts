import { Arc } from './arc';
import { Coordinates } from './coordinates';
import { Element } from './element';

export interface PetriNet {
  text: string;
  arcs: Arc[];
  elements: Element[];
  offset?: Coordinates;
  currentRun?: boolean;
}

export function isRunEmpty(run: PetriNet): boolean {
  return run.arcs.length === 0 && run.elements.length === 0;
}
