import { MapSet } from '../../../../algorithms/regions/ilp-solver/map-set';
import { PartialOrder } from '../../../../classes/diagram/partial-order';
import { ConcurrencyRelation } from './concurrency-relation';
import { arePartialOrderPetriNetsIsomorphic } from './isomorph/petri-net-isomorphism.fn';
import { LogEvent } from './model/logEvent';
import { PetriNet } from './model/petri-net';
import { Place } from './model/place';
import { EditableStringSequenceWrapper } from './model/string-sequence';
import { Trace } from './model/trace';
import { Transition } from './model/transition';
import { PetriNetSequence } from './petri-net-sequence';
import { serializePn } from './serializer/serialize.fn';

export enum LogSymbol {
  START = '▶',
  STOP = '■',
}

export class PartialOrderNetWithContainedTraces {
  constructor(public net: PetriNet, public containedTraces: Array<Trace>) {}
}

export function transformToPartialOrders(
  log: Array<PartialOrder>,
  concurrencyRelation: ConcurrencyRelation
): Array<PartialOrderNetWithContainedTraces> {
  if (log.length === 0) {
    return [];
  }

  concurrencyRelation.relabeler.relabelSequencesPreserveNonUniqueIdentities(
    log
  );

  const sequences = convertLogToPetriNetSequences(log);

  // transitive reduction requires all places to be internal => always add start/stop and remove later
  sequences.forEach((seq) => {
    addStartAndStopEvent(seq);
  });

  const partialOrders = convertSequencesToPartialOrders(
    sequences,
    concurrencyRelation
  );

  removeTransitiveDependencies(partialOrders);

  partialOrders.forEach((po) => {
    removeStartAndStopEvent(po);
  });
  const result = filterAndCombinePartialOrderNets(partialOrders);

  concurrencyRelation.relabeler.undoSequencesLabeling(
    result.map(
      (po) => new EditableStringSequenceWrapper(po.net.getTransitions())
    )
  );

  return result;
}

function convertLogToPetriNetSequences(
  log: Array<PartialOrder>
): Array<PetriNetSequence> {
  const netSequences = new Set<PetriNetSequence>();
  const tree = new PrefixTree<PetriNetSequence>();

  for (const trace of log) {
    const sequence = new PetriNetSequence();
    tree.insert(
      trace,
      (treeNode) => {
        if (treeNode.hasChildren()) {
          return undefined;
        }
        sequence.net.frequency = 1;
        netSequences.add(sequence);
        return sequence;
      },
      (node, treeNode) => {
        if (!treeNode.hasChildren()) {
          node.net.frequency =
            node.net.frequency === undefined ? 1 : node.net.frequency + 1;
        }
      },
      (label, previousNode) => {
        sequence.appendEvent(label);
        if (previousNode !== undefined) {
          netSequences.delete(previousNode);
        }
      }
    );
  }

  const serialized = Array.from(netSequences).map((sequence) =>
    serializePn(sequence.net)
  );
  return Array.from(netSequences);
}

function addStartAndStopEvent(sequence: PetriNetSequence) {
  // add events to net
  const sequenceNet = sequence.net;
  const firstLast = sequenceNet
    .getPlaces()
    .filter((p) => p.ingoingArcs.length === 0 || p.outgoingArcs.length === 0);
  if (firstLast.length !== 2) {
    console.debug(sequenceNet);
    throw new Error(
      'Illegal state. A sequence must have one start and one end place.'
    );
  }
  let first, last: Place;
  if (firstLast[0].ingoingArcs.length === 0) {
    first = firstLast[0];
    last = firstLast[1];
  } else {
    first = firstLast[1];
    last = firstLast[0];
  }

  const preStart = new Place();
  const start = new Transition(LogSymbol.START);
  sequenceNet.addPlace(preStart);
  sequenceNet.addTransition(start);
  sequenceNet.addArc(preStart, start);
  sequenceNet.addArc(start, first);

  const stop = new Transition(LogSymbol.STOP);
  const postStop = new Place();
  sequenceNet.addTransition(stop);
  sequenceNet.addPlace(postStop);
  sequenceNet.addArc(last, stop);
  sequenceNet.addArc(stop, postStop);

  // add events to trace
  sequence.trace.events.unshift(new LogEvent(LogSymbol.START));
  sequence.trace.events.push(new LogEvent(LogSymbol.STOP));
}

function removeStartAndStopEvent(
  partialOrder: PartialOrderNetWithContainedTraces
) {
  // remove from net
  const partialOrderNet = partialOrder.net;
  if (
    partialOrderNet.inputPlaces.size !== 1 ||
    partialOrderNet.outputPlaces.size !== 1
  ) {
    console.debug(partialOrderNet);
    throw new Error('illegal state');
  }

  let startTransition: Transition | undefined = undefined;
  partialOrderNet.inputPlaces.forEach((id) => {
    const inPlace = partialOrderNet.getPlace(id)!;
    startTransition = inPlace.outgoingArcs[0].destination as Transition;
    partialOrderNet.removePlace(id);
  });

  if (
    startTransition === undefined ||
    (startTransition as Transition).label !== LogSymbol.START
  ) {
    throw new Error('illegal state');
  }
  partialOrderNet.removeTransition(startTransition);

  let stopTransition: Transition | undefined = undefined;
  partialOrderNet.outputPlaces.forEach((id) => {
    const outPlace = partialOrderNet.getPlace(id)!;
    stopTransition = outPlace.ingoingArcs[0].source as Transition;
    partialOrderNet.removePlace(id);
  });

  if (
    stopTransition === undefined ||
    (stopTransition as Transition).label !== LogSymbol.STOP
  ) {
    throw new Error('illegal state');
  }
  partialOrderNet.removeTransition(stopTransition);

  // remove from trace
  partialOrder.containedTraces[0].events.shift();
  partialOrder.containedTraces[0].events.pop();
}

function convertSequencesToPartialOrders(
  sequences: Array<PetriNetSequence>,
  concurrencyRelation: ConcurrencyRelation
): Array<PartialOrderNetWithContainedTraces> {
  return sequences.map((seq) =>
    convertSequenceToPartialOrder(seq, concurrencyRelation)
  );
}

function convertSequenceToPartialOrder(
  sequence: PetriNetSequence,
  concurrencyRelation: ConcurrencyRelation
): PartialOrderNetWithContainedTraces {
  const net = sequence.net;
  const placeQueue = net.getPlaces();

  while (placeQueue.length > 0) {
    const place = placeQueue.shift() as Place;
    if (place.ingoingArcs.length === 0 || place.outgoingArcs.length === 0) {
      continue;
    }
    if (place.ingoingArcs.length > 1 || place.outgoingArcs.length > 1) {
      console.debug(place);
      console.debug(sequence);
      throw new Error(
        'Illegal state. The processed net is not a partial order!'
      );
    }

    const preEvent = place.ingoingArcs[0].source as Transition;
    const postEvent = place.outgoingArcs[0].destination as Transition;
    if (
      preEvent.label! === postEvent.label! || // no auto-concurrency
      !concurrencyRelation.isConcurrent(preEvent.label!, postEvent.label!) ||
      !concurrencyRelation.isConcurrent(postEvent.label!, preEvent.label!)
    ) {
      continue;
    }

    net.removePlace(place);

    for (const a of preEvent.ingoingArcs) {
      const inPlace = a.source as Place;

      if (
        inPlace.ingoingArcs.length === 0 &&
        postEvent.ingoingArcs.some((a) => a.source.ingoingArcs.length === 0)
      ) {
        continue;
      }
      if (inPlace.ingoingArcs.length > 0) {
        const inTransId = inPlace.ingoingArcs[0].sourceId;
        if (
          postEvent.ingoingArcs.some(
            (a) => a.source.ingoingArcs[0]?.sourceId === inTransId
          )
        ) {
          continue;
        }
      }

      const clone = new Place();
      net.addPlace(clone);
      placeQueue.push(clone);

      if (inPlace.ingoingArcs.length > 0) {
        net.addArc(inPlace.ingoingArcs[0].source as Transition, clone);
      }

      net.addArc(clone, postEvent);
    }

    for (const a of postEvent.outgoingArcs) {
      const outPlace = a.destination as Place;

      if (
        outPlace.outgoingArcs.length === 0 &&
        preEvent.outgoingArcs.some(
          (a) => a.destination.outgoingArcs.length === 0
        )
      ) {
        continue;
      }
      if (outPlace.outgoingArcs.length > 0) {
        const outTransId = outPlace.outgoingArcs[0].destinationId;
        if (
          preEvent.outgoingArcs.some(
            (a) => a.destination.outgoingArcs[0]?.destinationId === outTransId
          )
        ) {
          continue;
        }
      }

      const clone = new Place();
      net.addPlace(clone);
      placeQueue.push(clone);

      if (outPlace.outgoingArcs.length > 0) {
        net.addArc(clone, outPlace.outgoingArcs[0].destination as Transition);
      }

      net.addArc(preEvent, clone);
    }
  }

  return new PartialOrderNetWithContainedTraces(net, [sequence.trace]);
}

function removeTransitiveDependencies(
  pos: Array<PartialOrderNetWithContainedTraces>
) {
  pos.forEach((po) => performTransitiveReduction(po.net));
}

function performTransitiveReduction(partialOrder: PetriNet) {
  // algorithm based on "Algorithm A" from https://www.sciencedirect.com/science/article/pii/0304397588900321
  // the paper itself offers an improvement over this Algorithm - might be useful if A proves to be too slow

  const reverseTransitionOrder =
    reverseTopologicalTransitionOrdering(partialOrder);

  const reverseOrder = new Map<string, number>(
    reverseTransitionOrder.map((t, i) => [t.getId(), i])
  );
  const transitiveDescendants = new MapSet<string, string>();
  const reducedDescendants = new MapSet<string, string>();

  for (const t of reverseTransitionOrder) {
    transitiveDescendants.add(t.getId(), t.getId());
    const childrenIds = getChildIds(t).sort(
      (id1, id2) => reverseOrder.get(id2)! - reverseOrder.get(id1)!
    );
    for (const childId of childrenIds) {
      if (!transitiveDescendants.has(t.getId(), childId)) {
        transitiveDescendants.addAll(
          t.getId(),
          transitiveDescendants.get(childId)
        );
        reducedDescendants.add(t.getId(), childId);
      }
    }
  }

  // remove transitive connections (places)
  for (const t of partialOrder.getTransitions()) {
    if (t.label === LogSymbol.STOP) {
      continue;
    }
    for (const a of t.outgoingArcs) {
      if (
        !reducedDescendants.has(
          t.getId(),
          a.destination.outgoingArcs[0].destinationId
        )
      ) {
        partialOrder.removePlace(a.destinationId);
      }
    }
  }
}

function getChildIds(transition: Transition): Array<string> {
  return transition.outgoingArcs.flatMap((a) =>
    a.destination.outgoingArcs.map((ta) => ta.destination.getId())
  );
}

/**
 * Returns an array containing the transitions of the given net. The result is in reverse-topological order i.e.
 * transitions at the front of the Array appear later in the net.
 *
 * Implementation based on https://www.geeksforgeeks.org/topological-sorting/3
 * @param net a Petri Net representation of a partial order
 */
function reverseTopologicalTransitionOrdering(
  net: PetriNet
): Array<Transition> {
  const resultStack: Array<Transition> = [];
  const visited = new Set<string>();
  for (const t of net.getTransitions()) {
    if (visited.has(t.getId())) {
      continue;
    }
    topologicalOrderingUtil(t, visited, resultStack);
  }
  return resultStack;
}

function topologicalOrderingUtil(
  t: Transition,
  visited: Set<string>,
  resultStack: Array<Transition>
) {
  visited.add(t.getId());
  for (const a of t.outgoingArcs) {
    const nextTransition = a.destination.outgoingArcs[0]?.destination;
    if (nextTransition === undefined) {
      continue;
    }
    if (visited.has(nextTransition.getId())) {
      continue;
    }
    topologicalOrderingUtil(nextTransition as Transition, visited, resultStack);
  }
  resultStack.push(t);
}

function filterAndCombinePartialOrderNets(
  partialOrders: Array<PartialOrderNetWithContainedTraces>
): Array<PartialOrderNetWithContainedTraces> {
  const unique: Array<PartialOrderNetWithContainedTraces> = [
    partialOrders.shift()!,
  ];

  for (const uncheckedOrder of partialOrders) {
    let discard = false;
    for (const uniqueOrder of unique) {
      if (
        arePartialOrderPetriNetsIsomorphic(uncheckedOrder.net, uniqueOrder.net)
      ) {
        discard = true;
        uniqueOrder.net.frequency =
          uniqueOrder.net.frequency! + uncheckedOrder.net.frequency!;
        uniqueOrder.containedTraces.push(...uncheckedOrder.containedTraces);
        break;
      }
    }
    if (!discard) {
      unique.push(uncheckedOrder);
    }
  }

  return unique;
}

export class PrefixGraphNode<T> {
  private _children: Map<string, PrefixGraphNode<T>>;
  private _content: T | undefined;

  constructor(content?: T) {
    this._children = new Map();
    this.content = content;
  }

  get content(): T | undefined {
    return this._content;
  }

  set content(value: T | undefined) {
    this._content = value;
  }

  public getChild(key: string): PrefixGraphNode<T> | undefined {
    return this._children.get(key);
  }

  public addChild(key: string, content?: T): PrefixGraphNode<T>;
  public addChild(key: string, content: PrefixGraphNode<T>): PrefixGraphNode<T>;
  public addChild(
    key: string,
    content?: T | PrefixGraphNode<T>
  ): PrefixGraphNode<T> {
    let child;
    if (content instanceof PrefixGraphNode) {
      child = content;
    } else {
      child = new PrefixGraphNode<T>(content);
    }
    this._children.set(key, child);
    return child;
  }

  public hasChildren(): boolean {
    return this._children.size !== 0;
  }
}

export class PrefixTree<T> {
  private readonly _root: PrefixGraphNode<T>;

  constructor(rootContent?: T) {
    this._root = new PrefixGraphNode<T>(rootContent);
  }

  public insert(
    path: PartialOrder,
    newNodeContent: (treeWrapper: PrefixGraphNode<T>) => T | undefined,
    updateNodeContent: (node: T, treeWrapper: PrefixGraphNode<T>) => void,
    stepReaction: (
      step: string,
      previousNode: T | undefined,
      previousTreeWrapper: PrefixGraphNode<T>
    ) => void = () => {},
    newStepNode: (
      step: string,
      prefix: Array<string>,
      previousNode: T | undefined
    ) => T | undefined = () => undefined
  ): void {
    let currentNode = this._root;
    const prefix: Array<string> = [];
    for (let i = 0; i < path.events.length; i++) {
      const step = path.events[i].label;
      stepReaction(step, currentNode.content, currentNode);
      const child = currentNode.getChild(step);
      if (child === undefined) {
        currentNode = currentNode.addChild(
          step,
          newStepNode(step, [...prefix], currentNode.content)
        );
      } else {
        currentNode = child;
      }
      prefix.push(step);
    }
    if (currentNode.content !== undefined) {
      updateNodeContent(currentNode.content, currentNode);
    } else {
      currentNode.content = newNodeContent(currentNode);
    }
  }
}
