import { Arc } from '../arc';
import { PetriNet } from '../petri-net';
import { Transition } from '../transition';

export function hasCycles(run: PetriNet): boolean {
  return getCycles(run).length > 0;
}

export function getCycles(run: PetriNet): Arc[] {
  const visitedArcs = new Set<Arc>();
  const cyclicArcs = new Array<Arc>();

  run.arcs.forEach((arc) => {
    const visitedTransitions = new Set<Transition>();

    const source = run.transitions.find((element) => element.id === arc.source);
    if (source) {
      visitedTransitions.add(source);
    }

    checkArcCycle(run, arc, visitedArcs, visitedTransitions, cyclicArcs);
  });
  return cyclicArcs;
}

/**
 * checks an arc sequence for cycles
 * @param currentRun run to parse
 * @param arc starting arc
 * @param visitedArcs already visited arcs
 * @param visitedTransitions already visited transition
 * @param cyclicArcs last arcs when a cycle occurs
 */
function checkArcCycle(
  currentRun: PetriNet,
  arc: Arc,
  visitedArcs: Set<Arc>,
  visitedTransitions: Set<Transition>,
  cyclicArcs: Arc[]
): void {
  const target = currentRun.transitions.find(
    (element) => element.id === arc.target
  );
  if (visitedArcs.has(arc) || !target) {
    return;
  }
  visitedArcs.add(arc);

  //transition already visited in this sequence?

  if (visitedTransitions.has(target)) {
    cyclicArcs.push(arc);
    return;
  }
  visitedTransitions.add(target);

  //continue with the sequences

  target.outgoingArcs.forEach((outArc) => {
    checkArcCycle(
      currentRun,
      outArc,
      visitedArcs,
      visitedTransitions,
      cyclicArcs
    );
  });

  visitedTransitions.delete(target);
}
