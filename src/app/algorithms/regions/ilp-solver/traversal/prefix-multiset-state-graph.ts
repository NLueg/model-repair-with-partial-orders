import { PartialOrder } from '../../../../classes/diagram/partial-order';
import { addToMultiset, cloneMultiset, Multiset } from './multiset';
import { MultisetEquivalent } from './multiset-equivalent';
import { MultisetMap } from './multiset-map';
import { PrefixGraphNode } from './prefix-graph-node';

class MultisetEquivalentWrapper<T> extends MultisetEquivalent {
  public wrapped: T & MultisetEquivalent;
  public node?: PrefixGraphNode<T & MultisetEquivalent>;

  constructor(wrapped: T & MultisetEquivalent) {
    super(wrapped.multiset);
    this.wrapped = wrapped;
  }

  merge(ms: MultisetEquivalent): void {
    this.wrapped.merge(ms);
  }
}

export class PrefixMultisetStateGraph<T> {
  private readonly _root: PrefixGraphNode<T & MultisetEquivalent>;
  private readonly _stateMap: MultisetMap<
    MultisetEquivalentWrapper<T & MultisetEquivalent>
  >;

  constructor(rootContent: T & MultisetEquivalent) {
    this._root = new PrefixGraphNode<T & MultisetEquivalent>(rootContent);
    this._stateMap = new MultisetMap<
      MultisetEquivalentWrapper<T & MultisetEquivalent>
    >();
  }

  insert(
    path: PartialOrder,
    newStepNode: (
      step: string,
      newState: Multiset,
      previousNode: T & MultisetEquivalent
    ) => T & MultisetEquivalent,
    newEdgeReaction: (
      step: string,
      previousNode: T & MultisetEquivalent
    ) => void = () => {},
    finalNodeReaction: (node: T & MultisetEquivalent) => void = () => {},
    stepReaction: (prefix: Array<string>, step: string) => void = () => {}
  ): void {
    let currentNode = this._root;
    const prefix: Array<string> = [];
    for (let i = 0; i < path.events.length; i++) {
      const step = path.events[i].label;
      stepReaction(prefix, step);
      const child = currentNode.getChild(step);
      if (child !== undefined) {
        currentNode = child;
        prefix.push(step);
        continue;
      }
      const nextMultiset = this.stepState(currentNode.content!.multiset, step);
      let nextState = this._stateMap.get(nextMultiset);
      if (nextState === undefined) {
        nextState = new MultisetEquivalentWrapper<T & MultisetEquivalent>(
          newStepNode(step, nextMultiset, currentNode.content!)
        );
        this._stateMap.put(nextState);
      }
      newEdgeReaction(step, currentNode.content!);
      let nextNode = nextState.node;
      if (nextNode === undefined) {
        nextNode = currentNode.addChild(step, nextState.wrapped);
        nextState.node = nextNode;
      } else {
        currentNode.addChild(step, nextNode);
      }
      currentNode = nextNode;
      prefix.push(step);
    }
    finalNodeReaction(currentNode.content!);
  }

  private stepState(currentState: Multiset, step: string): Multiset {
    const clone = cloneMultiset(currentState);
    addToMultiset(clone, step);
    return clone;
  }

  public getGraphStates(): Array<T & MultisetEquivalent> {
    return this._stateMap.values().map((w) => w.wrapped);
  }
}
