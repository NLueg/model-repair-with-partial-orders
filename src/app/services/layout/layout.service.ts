import { Point } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../../classes/diagram/arc';
import {
  ConcreteElement,
  ConcreteElementWithArcs,
} from '../../classes/diagram/draggable';
import { getElementsWithArcs } from '../../classes/diagram/functions/net-helper.fn';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { Transition } from '../../classes/diagram/transition';
import { PLACE_STYLE, TRANSITION_STYLE } from '../element-style';
import { CrossingMinimizer } from './crossing-minimizer';

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
    // this.minimizeCrossing(net, originalLayeredNodes);

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
    layers: Array<Array<ConcreteElement>>,
    nodeLayer: Map<string, number>
  ) {
    for (let currentLayer = 0; currentLayer < layers.length; currentLayer++) {
      for (const node of layers[currentLayer]) {
        if (!(node as any)?.outgoingArcs) {
          continue;
        }

        for (const arc of (node as ConcreteElementWithArcs).outgoingArcs) {
          const targetLayer = nodeLayer.get(arc.target) as number;
          const diff = targetLayer - currentLayer;
          if (Math.abs(diff) == 1) {
            continue;
          }

          const innerTargetLayer = layers
            .flatMap((nodeLayer) =>
              nodeLayer.findIndex((elem) => elem.id === arc.target)
            )
            .find((index) => index != -1);
          const innerSourceLayer = layers
            .flatMap((nodeLayer) =>
              nodeLayer.findIndex((elem) => elem.id === arc.source)
            )
            .find((index) => index != -1);

          const change = Math.sign(diff);
          for (
            let i = currentLayer + change;
            i != targetLayer;
            i = i + change
          ) {
            // this ID calculation does not guarantee a unique ID, which could be a problem in the future
            const breakpoint: Breakpoint = {
              type: 'breakpoint',
              id: node.id + i,
              x: 0,
              y: 0,
              arc,
            };
            layers[i].splice(
              this.getIndexInCurrentLayer(
                layers,
                layers[i],
                targetLayer,
                currentLayer,
                innerTargetLayer ?? 0,
                innerSourceLayer ?? 0
              ),
              0,
              breakpoint
            );
            arc.breakpoints.push(breakpoint);
          }
        }
      }
    }
  }

  private getIndexInCurrentLayer(
    layers: Array<Array<ConcreteElement>>,
    layerForInsertion: ConcreteElement[],
    targetLayer: number,
    sourceLayer: number,
    innerTargetLayer: number,
    innerSourceLayer: number
  ): number {
    const targetLayerLength = layers[targetLayer].length;
    const sourceLayerLength = layers[sourceLayer].length;

    const targetIsAtEnd = targetLayerLength - 1 === innerTargetLayer;
    const sourceIsAtEnd = sourceLayerLength - 1 === innerSourceLayer;
    if (targetIsAtEnd && sourceIsAtEnd) {
      return layerForInsertion.length;
    }

    if (innerTargetLayer === innerSourceLayer) {
      return innerTargetLayer;
    }

    const targetIsInCenterPosition =
      getHalfValue(targetLayerLength) === innerTargetLayer;
    const sourceIsInCenterPosition =
      getHalfValue(sourceLayerLength) === innerSourceLayer;
    if (targetIsInCenterPosition && sourceIsInCenterPosition) {
      return getHalfValue(layerForInsertion.length);
    }

    return Math.min(
      innerTargetLayer ?? layers.length - 1,
      innerSourceLayer ?? layers.length - 1
    );
  }

  /**
   * Rearrange order of elements/breakpoints per layer to minimize crossing of lines
   * For every layer check to optimal ordering with the lowest crossing of incoming and outgoing lines
   * Note: This will not always find the optimal order throughout all layers!
   * @param currentNet run to parse
   * @param layers layers with elements and breakpoints
   */
  private minimizeCrossing(
    currentNet: PetriNet,
    layers: Array<ConcreteElement[]>
  ): void {
    const minimizer = new CrossingMinimizer(currentNet, layers);

    layers.forEach((layer, index) => {
      const newLayer = minimizer.reorderLayer(layer, index);
      layer.splice(0, layer.length);
      layer.push(...newLayer);
    });
  }
}

function getHalfValue(value: number): number {
  if (value === 1) {
    return 0;
  }
  return Math.floor(value / 2);
}
