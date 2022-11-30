import { Arc } from './arc';

export interface Element {
  x?: number;
  y?: number;
  label: string;
  id: string;
  incomingArcs: Arc[];
  outgoingArcs: Arc[];
  layerPos?: number;
  currentRun?: boolean;
}

export function doesElementBelongToCurrentRun(element: Element): boolean {
  if (element.currentRun) {
    return true;
  } else return false;
}
