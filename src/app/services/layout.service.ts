import { Point } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../classes/diagram/arc';
import {
  ConcreteElement,
  ConcreteElementWithArcs,
} from '../classes/diagram/draggable';
import { getElementsWithArcs } from '../classes/diagram/functions/net-helper.fn';
import { PetriNet } from '../classes/diagram/petri-net';
import { Place } from '../classes/diagram/place';
import { Transition } from '../classes/diagram/transition';
import { PLACE_STYLE, TRANSITION_STYLE } from './element-style';

export type LayoutResult = { net: PetriNet; point: Point };

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly LAYER_OFFSET = 50;
  private readonly NODE_OFFSET = 40;

  layout(net: PetriNet): LayoutResult {
    const transitionWidth = parseInt(TRANSITION_STYLE.width);
    const transitionHeight = parseInt(TRANSITION_STYLE.height);
    const placeWidth = parseInt(PLACE_STYLE.r) * 2;
    const placeHeight = parseInt(PLACE_STYLE.r) * 2;

    const CELL_WIDTH = Math.max(transitionWidth, placeWidth);
    const CELL_HEIGHT = Math.max(transitionHeight, placeHeight);

    const LAYER_SPACING = this.LAYER_OFFSET + CELL_WIDTH;
    const NODE_SPACING = this.NODE_OFFSET + CELL_HEIGHT;

    // Sugiyama algorithm implemented loosely based on: https://blog.disy.net/sugiyama-method/
    const acyclicArcs = this.removeCycles(net);
    const acyclicNet = this.createFromArcSubset(net, acyclicArcs);
    const layeredNodes = this.assignLayers(acyclicNet);

    const nodeLayer = new Map<string, number>(); // id -> layer

    const originalLayeredNodes = layeredNodes.map((layer, index) =>
      layer.map((node) => {
        const n =
          net.transitions.find((transition) => transition.id === node.id) ??
          net.places.find((place) => place.id === node.id);
        if (!n) {
          throw new Error('Element not found!');
        }

        nodeLayer.set(n.id, index);
        return n;
      })
    ) as Array<Array<Transition | Place | Breakpoint>>;

    this.addBreakpoints(originalLayeredNodes, nodeLayer);
    let maxNodesPerLayer = 0;
    for (const layer of originalLayeredNodes) {
      maxNodesPerLayer = Math.max(maxNodesPerLayer, layer.length);
    }
    this.minimizeCrossing(net, originalLayeredNodes);

    let maxX = 0;
    let maxY = 0;
    for (
      let layerIndex = 0;
      layerIndex < originalLayeredNodes.length;
      layerIndex++
    ) {
      const layer = originalLayeredNodes[layerIndex];
      const EXTRA_NODE_SPACING =
        layer.length < maxNodesPerLayer
          ? (NODE_SPACING * (maxNodesPerLayer - layer.length)) /
            (layer.length + 1)
          : 0;
      for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
        const node = layer[nodeIndex];

        node.layerNodes = layer;
        node.layerIndex = nodeIndex;

        node.x = layerIndex * LAYER_SPACING + CELL_WIDTH / 2;
        const nodeWidth = node.type === 'breakpoint' ? 0 : CELL_WIDTH;

        let nodeHeight = CELL_HEIGHT;
        node.y =
          nodeIndex * NODE_SPACING +
          (nodeIndex + 1) * EXTRA_NODE_SPACING +
          CELL_HEIGHT / 2;
        if (node.type === 'breakpoint') {
          // breakpoint
          nodeHeight = 0;
        }

        maxX = Math.max(maxX, (node.x ?? 0) + nodeWidth / 2);
        maxY = Math.max(maxY, (node.y ?? 0) + nodeHeight / 2);
      }
    }

    return {
      net: net,
      point: { x: maxX, y: maxY },
    };
  }

  private removeCycles(net: PetriNet): Array<Arc> {
    const explored = new Set<Arc>();
    const arcs = net.arcs.slice();
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      if (!explored.has(arc)) {
        this.dfsRemoveCycles(net, arc, explored, new Set([arc.source]), arcs);
      }
    }
    return arcs;
  }

  private createFromArcSubset(net: PetriNet, arcs: Array<Arc>): PetriNet {
    const result: PetriNet = {
      transitions: [],
      places: [],
      arcs: [],
    };
    net.places.forEach((p) => {
      result.places.push({
        ...p,
      });
    });
    net.transitions.forEach((t) => {
      result.transitions.push({
        ...t,
      });
    });

    arcs.forEach((a) => {
      result.arcs.push({
        ...a,
      });
    });
    return result;
  }

  private dfsRemoveCycles(
    net: PetriNet,
    arc: Arc,
    explored: Set<Arc>,
    predecessors: Set<string>,
    arcs: Array<Arc>
  ) {
    if (explored.has(arc)) {
      return;
    }
    explored.add(arc);
    if (predecessors.has(arc.target)) {
      this.removeArc(arcs, arc);
      return;
    }
    predecessors.add(arc.target);

    const elementsWithArcs = getElementsWithArcs(net);
    const destination = elementsWithArcs.find(
      (element) => element.id === arc.target
    );
    for (const outgoingArc of destination?.outgoingArcs ?? []) {
      this.dfsRemoveCycles(net, outgoingArc, explored, predecessors, arcs);
    }
    predecessors.delete(arc.target);
  }

  private removeArc(arcs: Array<Arc>, arc: Arc) {
    arcs.splice(
      arcs.findIndex((a) => a === arc),
      1
    );
  }

  private assignLayers(net: PetriNet): Array<Array<ConcreteElement>> {
    let nodes: ConcreteElementWithArcs[] = [...net.places, ...net.transitions];
    let arcs = net.arcs;

    const result: Array<Array<ConcreteElementWithArcs>> = [];

    while (nodes.length > 0) {
      const currentLayerNodes = this.nodesWithoutIncomingArcs(nodes, arcs);
      if (currentLayerNodes.length === 0) {
        throw Error('Cyclic net!');
      }
      const cln = new Set<ConcreteElement>(currentLayerNodes);
      nodes = nodes.filter((n) => !cln.has(n));

      const outgoingArcs = Array.from(
        new Set<Arc>(currentLayerNodes.flatMap((n) => n.outgoingArcs))
      );
      arcs = arcs.filter(
        (a) =>
          !outgoingArcs.find(
            (outgoingArc) =>
              outgoingArc.source === a.source && outgoingArc.target,
            a.target
          )
      );
      result.push(currentLayerNodes);
    }
    return result;
  }

  private nodesWithoutIncomingArcs(
    nodes: ConcreteElementWithArcs[],
    arcs: Arc[]
  ): Array<ConcreteElementWithArcs> {
    const nodesWithIncomingArcs = new Set<string>();
    arcs.forEach((a) => {
      nodesWithIncomingArcs.add(a.target);
    });
    return nodes.filter((n) => !nodesWithIncomingArcs.has(n.id));
  }

  private addBreakpoints(
    nodes: Array<Array<ConcreteElement>>,
    nodeLayer: Map<string, number>
  ) {
    for (let layerI = 0; layerI < nodes.length; layerI++) {
      for (const node of nodes[layerI]) {
        if (!(node as any)?.outgoingArcs) {
          continue;
        }

        for (const arc of (node as ConcreteElementWithArcs).outgoingArcs) {
          const destinationLayer = nodeLayer.get(arc.target) as number;
          const diff = destinationLayer - layerI;
          if (Math.abs(diff) == 1) {
            continue;
          }
          const change = Math.sign(diff);
          for (let i = layerI + change; i != destinationLayer; i += change) {
            // this ID calculation does not guarantee a unique ID, which could be a problem in the future
            const breakpoint: Breakpoint = {
              type: 'breakpoint',
              id: node.id + i,
              x: 0,
              y: 0,
              arc,
            };
            nodes[i].push(breakpoint);
            arc.breakpoints.push(breakpoint);
          }
        }
      }
    }
  }

  /**
   * Rearrange order of elements/breakpoints per layer to minimize crossing of lines
   * For every layer check to optimal ordering with the lowest crossing of incoming and outgoing lines
   * Note: This will not always find the optimal order throughout all layers!
   * @param currentRun run to parse
   * @param layers layers with elements and breakpoints
   */
  private minimizeCrossing(
    currentRun: PetriNet,
    layers: Array<ConcreteElement[]>
  ): void {
    layers.forEach((layer, index) => {
      const layerTmp = new Array<ConcreteElement>();
      this.reorderLayer(currentRun, layers, layer, index, 0, layerTmp);
      layer.splice(0, layer.length);
      layer.push(...layerTmp);
    });
  }

  /**
   * Find the optimal order for a single layer
   * @param currentNet run to parse
   * @param layers all layers
   * @param layer current layer
   * @param layerIndex index of current layer
   * @param currentLayerPosition current position in the layer which must be filled with an element
   * @param reorderedLayer layer with rearranged order
   * @returns number of crossings
   */
  private reorderLayer(
    currentNet: PetriNet,
    layers: Array<ConcreteElement[]>,
    layer: ConcreteElement[],
    layerIndex: number,
    currentLayerPosition: number,
    reorderedLayer: ConcreteElement[]
  ): number {
    let min = this.countCrossings(currentNet, layers, layerIndex);
    let minLayer = layer;

    const tmp = layer[currentLayerPosition];

    if (currentLayerPosition == layer.length - 1) {
      const crossings = this.countCrossings(currentNet, layers, layerIndex);
      if (crossings < min) {
        min = crossings;
        minLayer = [...layer];
      }
    } else {
      // Loop through all remaining elements and set each element once to the current position
      for (let i = currentLayerPosition + 1; i < layer.length; i++) {
        // ignore elements/breakpoints with fixed positions
        if (!layer[i].layerIndex && !tmp.layerIndex) {
          layer[currentLayerPosition] = layer[i];
          layer[i] = tmp;
        }
        const layerTmp = new Array<ConcreteElement>();
        const crossings = this.reorderLayer(
          currentNet,
          layers,
          layer,
          layerIndex,
          currentLayerPosition + 1,
          layerTmp
        );
        if (crossings < min) {
          min = crossings;
          minLayer = layerTmp;
        }
        if (!layer[i].layerIndex && !tmp.layerIndex) {
          layer[i] = layer[currentLayerPosition];
          layer[currentLayerPosition] = tmp;
        }
      }
    }

    reorderedLayer.push(...minLayer);
    return min;
  }

  /**
   * Identifies the number of crossing between the actual and previous/next layer
   * @param currentRun run to parse
   * @param layers all layers
   * @param layerIndex index of the current layer
   * @returns number of crossings
   */
  private countCrossings(
    currentRun: PetriNet,
    layers: Array<ConcreteElement[]>,
    layerIndex: number
  ): number {
    const connections: ElementArrows = {
      incoming: [],
      outgoing: [],
    };
    layers[layerIndex].forEach((e, index) => {
      const layerInfo = {
        layers,
        index,
        layerIndex,
      };
      if (e.type === 'place' || e.type === 'transition') {
        //Check outgoing and incoming lines from element to the next/previous breakpoint or element
        const elementWithArcs = e as ConcreteElementWithArcs;
        connections.incoming.push(
          ...this.findIncomingConnections(
            elementWithArcs.incomingArcs,
            layerInfo
          )
        );
        connections.outgoing.push(
          ...this.findOutgoingConnections(
            elementWithArcs.outgoingArcs,
            layerInfo
          )
        );
      } else {
        this.getElementArrowsFromBreakpoint(
          currentRun,
          connections,
          e as Breakpoint,
          layerInfo
        );
      }
    });

    return (
      this.calculateCrossings(connections.incoming) +
      this.calculateCrossings(connections.outgoing)
    );
  }

  private findIncomingConnections(arcs: Arc[], layerInfo: LayerInfoParameter) {
    const incomings = new Array<Connection>();

    arcs.forEach((arc) => {
      let sourcePos: number | undefined;
      if (arc.breakpoints.length > 0) {
        sourcePos = layerInfo.layers[layerInfo.layerIndex - 1].indexOf(
          arc.breakpoints[arc.breakpoints.length - 1]
        );
      } else {
        sourcePos = layerInfo.layers[layerInfo.layerIndex - 1].findIndex(
          (layer) => 'id' in layer && layer.id === arc.source
        );
      }

      if (sourcePos >= 0) {
        incomings.push({
          sourcePos: sourcePos,
          targetPos: layerInfo.index,
        });
      }
    });
    return incomings;
  }

  private findOutgoingConnections(
    arcs: Arc[],
    layerInfo: LayerInfoParameter
  ): Connection[] {
    const outgoings = new Array<Connection>();

    arcs.forEach((arc) => {
      let targetPos: number | undefined;
      if (arc.breakpoints.length > 0) {
        targetPos = layerInfo.layers[layerInfo.layerIndex + 1].indexOf(
          arc.breakpoints[0]
        );
      } else {
        targetPos = layerInfo.layers[layerInfo.layerIndex + 1].findIndex(
          (layer) => 'id' in layer && layer.id === arc.target
        );
      }

      if (targetPos >= 0)
        outgoings.push({
          sourcePos: layerInfo.index,
          targetPos: targetPos,
        });
    });
    return outgoings;
  }

  private calculateCrossings(connections: Array<Connection>): number {
    let crossings = 0;
    connections.forEach((e, index) => {
      for (let i = index + 1; i < connections.length; i++) {
        if (
          (e.sourcePos < connections[i].sourcePos &&
            e.targetPos > connections[i].targetPos) ||
          (e.sourcePos > connections[i].sourcePos &&
            e.targetPos < connections[i].targetPos)
        ) {
          crossings++;
        }
      }
    });
    return crossings;
  }

  private getElementArrowsFromBreakpoint(
    petriNet: PetriNet,
    connections: ElementArrows,
    breakpoint: Breakpoint,
    layerInfo: LayerInfoParameter
  ): void {
    // check incoming and outgoing line from breakpoint to the next/previous breakpoint or element
    let prev: ConcreteElement | undefined;
    let next: ConcreteElement | undefined;

    const breakpointIndex = breakpoint.arc.breakpoints.indexOf(breakpoint);

    const elementsWithArcs = getElementsWithArcs(petriNet);
    const source = elementsWithArcs.find(
      (element) => element.id === breakpoint.arc.source
    );
    if (breakpointIndex === 0 && source) {
      prev = source;
    } else if (breakpointIndex > 0) {
      prev = breakpoint.arc.breakpoints[breakpointIndex - 1];
    }
    if (prev) {
      connections.incoming.push({
        sourcePos: layerInfo.layers[layerInfo.layerIndex - 1].indexOf(prev),
        targetPos: layerInfo.index,
      });
    }

    const target = elementsWithArcs.find(
      (element) => element.id === breakpoint.arc.target
    );
    if (breakpointIndex == breakpoint.arc.breakpoints.length - 1 && target) {
      next = target;
    } else if (breakpoint.arc.breakpoints.length > breakpointIndex + 1) {
      next = breakpoint.arc.breakpoints[breakpointIndex + 1];
    }
    if (next) {
      connections.outgoing.push({
        sourcePos: layerInfo.index,
        targetPos: layerInfo.layers[layerInfo.layerIndex + 1].indexOf(next),
      });
    }
  }
}

type Connection = {
  sourcePos: number;
  targetPos: number;
};

type ElementArrows = {
  incoming: Connection[];
  outgoing: Connection[];
};

type LayerInfoParameter = {
  layers: Array<ConcreteElement[]>;
  layerIndex: number;
  index: number;
};
