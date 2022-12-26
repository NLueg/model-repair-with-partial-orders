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

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly LAYER_OFFSET = 50;
  private readonly NODE_OFFSET = 40;

  layout(net: PetriNet): { net: PetriNet; point: Point } {
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

        node.layerPos = nodeIndex;

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
        break;
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
            };
            nodes[i].push(breakpoint);
            arc.breakpoints.push(breakpoint);
          }
        }
      }
    }
  }
}
