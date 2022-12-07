import { ConcreteElement } from './draggable';

export type Arc = {
  source: string;
  target: string;
  weight: number;
  breakpoints: Breakpoint[];
  currentRun?: boolean;
};

export interface Breakpoint extends ConcreteElement {
  x: number;
  y: number;
  arc: Arc;
  layerPos?: number;
}

export function doesArcBelongToCurrentRun(arc: Arc): boolean {
  if (arc.currentRun) {
    return true;
  } else return false;
}
