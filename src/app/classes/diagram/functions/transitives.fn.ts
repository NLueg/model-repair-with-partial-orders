import { Arc } from '../arc';
import { Run } from '../run';
import { copyRun } from './run-helper.fn';

export function hasTransitiveArcs(run: Run): boolean {
  return getTransitiveArcs(run).size > 0;
}

export function getTransitiveArcs(run: Run): Set<Arc> {
  const localRun = copyRun(run, false);
  const checkedArcs = new Set<Arc>();
  const possibleArcs: Arc[] = [];
  let allTransitivesFound = false;
  const transitiveArcs = new Set<Arc>();
  // construct initial set of transitive arcs
  localRun.arcs.forEach((arc) => {
    if (checkedArcs.has(arc)) {
      return;
    }
    checkedArcs.add(arc);
    const followingArcs = run.arcs.filter(
      (element) => element.source === arc.target
    );
    followingArcs.forEach((followingArc) => {
      possibleArcs.push({
        source: arc.source,
        target: followingArc.target,
        breakpoints: [],
      });
    });
  });
  //add new arcs to transitive arcs until no new arcs are found
  while (!allTransitivesFound) {
    let numberOfFollowingArcs = 0;
    possibleArcs.forEach((arc) => {
      if (checkedArcs.has(arc)) {
        return;
      }
      checkedArcs.add(arc);
      const followingArcs = run.arcs.filter(
        (element) => element.source === arc.target
      );
      numberOfFollowingArcs += followingArcs.length;
      followingArcs.forEach((followingArc) => {
        possibleArcs.push({
          source: arc.source,
          target: followingArc.target,
          breakpoints: [],
        });
      });
    });
    allTransitivesFound = numberOfFollowingArcs === 0;
  }
  // check if one of the original arcs can be found in potentially transitives
  localRun.arcs.forEach((arc) => {
    const transitiveArc = possibleArcs.find(
      (element) =>
        element.source === arc.source && element.target === arc.target
    );
    if (transitiveArc) {
      transitiveArcs.add(transitiveArc);
    }
  });

  return transitiveArcs;
}

/**
 * checks an arc sequence for cycles
 * @param currentRun run to parse
 */
export function removeTransitives(currentRun: Run): void {
  Array.from(getTransitiveArcs(currentRun)).forEach((e) => {
    currentRun.arcs = currentRun.arcs.filter(
      (element) => element.source !== e.source || element.target !== e.target
    );
  });
}
