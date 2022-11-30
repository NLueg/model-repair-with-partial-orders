export type Arc = {
  source: string;
  target: string;
  breakpoints: Breakpoint[];
  currentRun?: boolean;
};

export type Breakpoint = {
  x: number;
  y: number;
  arc: Arc;
  layerPos?: number;
};

export function doesArcBelongToCurrentRun(arc: Arc): boolean {
  if (arc.currentRun) {
    return true;
  } else return false;
}
