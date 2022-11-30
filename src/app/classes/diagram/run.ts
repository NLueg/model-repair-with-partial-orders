import { Arc } from './arc';
import { Coordinates } from './coordinates';
import { Element } from './element';

export interface Run {
  text: string;
  arcs: Arc[];
  elements: Element[];
  warnings: string[];
  offset?: Coordinates;
  currentRun?: boolean;
}

export function isRunEmpty(run: Run): boolean {
  return run.arcs.length === 0 && run.elements.length === 0;
}

export function setCurrentRunFalse(run: Run): void {
  run.currentRun = false;
  run.arcs.forEach((arc) => (arc.currentRun = false));
  run.elements.forEach((element) => (element.currentRun = false));
}

export function setCurrentRunTrue(run: Run): void {
  run.currentRun = true;
  run.arcs.forEach((arc) => (arc.currentRun = true));
  run.elements.forEach((element) => (element.currentRun = true));
}
