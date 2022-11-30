import { Arc } from './arc';

export interface Element {
  x?: number;
  y?: number;
  label: string;
  id: string;
  incomingArcs: Arc[];
  outgoingArcs: Arc[];
  layerPos?: number;
}
