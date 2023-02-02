import { Arc, Breakpoint } from '../../classes/diagram/arc';
import {
  ConcreteElement,
  ConcreteElementWithArcs,
} from '../../classes/diagram/draggable';
import { getElementsWithArcs } from '../../classes/diagram/functions/net-helper.fn';
import { PetriNet } from '../../classes/diagram/petri-net';

export class CrossingMinimizer {
  constructor(
    private readonly currentNet: Readonly<PetriNet>,
    private readonly layers: Readonly<Array<ConcreteElement[]>>
  ) {}

  /**
   * Find the optimal order for a single layer
   * @param layer current layer
   * @param layerIndex index of current layer
   * @returns number of crossings
   */
  public reorderLayer(
    layer: ConcreteElement[],
    layerIndex: number
  ): ConcreteElement[] {
    const layerTmp = new Array<ConcreteElement>();
    this.reorderLayerRec(layer, layerIndex, 0, layerTmp);
    return layerTmp;
  }

  /**
   * Find the optimal order for a single layer
   * @param layer current layer
   * @param layerIndex index of current layer
   * @param currentLayerPosition current position in the layer which must be filled with an element
   * @param reorderedLayer layer with rearranged order
   * @returns number of crossings
   */
  private reorderLayerRec(
    layer: ConcreteElement[],
    layerIndex: number,
    currentLayerPosition: number,
    reorderedLayer: ConcreteElement[]
  ): number {
    let min = this.countCrossings(layerIndex);
    let minLayer = layer;

    const tmp = layer[currentLayerPosition];

    // Termination condition
    if (currentLayerPosition === layer.length - 1) {
      const crossings = this.countCrossings(layerIndex);
      if (crossings < min) {
        min = crossings;
        minLayer = [...layer];
      }
      reorderedLayer.push(...minLayer);
      return min;
    }

    // Loop through all remaining elements and set each element once to the current position
    for (let i = currentLayerPosition + 1; i < layer.length; i++) {
      layer[currentLayerPosition] = layer[i];
      layer[i] = tmp;

      const layerTmp = new Array<ConcreteElement>();
      const crossings = this.reorderLayerRec(
        layer,
        layerIndex,
        currentLayerPosition + 1,
        layerTmp
      );

      layer[i] = layer[currentLayerPosition];
      layer[currentLayerPosition] = tmp;

      if (crossings < min) {
        min = crossings;
        minLayer = layerTmp;
      }
    }

    reorderedLayer.push(...minLayer);
    return min;
  }

  /**
   * Identifies the number of crossing between the actual and previous/next layer
   * @param layerIndex index of the current layer
   * @returns number of crossings
   */
  private countCrossings(layerIndex: number): number {
    const connections: ElementArrows = {
      incoming: [],
      outgoing: [],
    };
    this.layers[layerIndex].forEach((e, index) => {
      const layerInfo = {
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
          connections,
          e as Breakpoint,
          layerInfo
        );
      }
    });

    return (
      calculateCrossings(connections.incoming) +
      calculateCrossings(connections.outgoing)
    );
  }

  private findIncomingConnections(arcs: Arc[], layerInfo: LayerInfoParameter) {
    const incomings = new Array<Connection>();

    arcs.forEach((arc) => {
      let sourcePos: number | undefined;
      if (arc.breakpoints.length > 0) {
        sourcePos = this.layers[layerInfo.layerIndex - 1].indexOf(
          arc.breakpoints[arc.breakpoints.length - 1]
        );
      } else {
        sourcePos = this.layers[layerInfo.layerIndex - 1].findIndex(
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

    if (this.layers.length <= layerInfo.layerIndex - 1) {
      return outgoings;
    }

    arcs.forEach((arc) => {
      let targetPos: number | undefined;

      const relevantLayer = this.layers[layerInfo.layerIndex + 1];

      if (arc.breakpoints.length > 0) {
        targetPos = relevantLayer?.indexOf(arc.breakpoints[0]) ?? 0;
      } else {
        targetPos =
          relevantLayer?.findIndex(
            (layer) => 'id' in layer && layer.id === arc.target
          ) ?? 0;
      }

      if (targetPos >= 0)
        outgoings.push({
          sourcePos: layerInfo.index,
          targetPos: targetPos,
        });
    });
    return outgoings;
  }

  private getElementArrowsFromBreakpoint(
    connections: ElementArrows,
    breakpoint: Breakpoint,
    layerInfo: LayerInfoParameter
  ): void {
    // check incoming and outgoing line from breakpoint to the next/previous breakpoint or element
    let prev: ConcreteElement | undefined;
    let next: ConcreteElement | undefined;

    const breakpointIndex = breakpoint.arc.breakpoints.indexOf(breakpoint);

    const elementsWithArcs = getElementsWithArcs(this.currentNet);
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
        sourcePos: this.layers[layerInfo.layerIndex - 1].indexOf(prev),
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
        targetPos: this.layers[layerInfo.layerIndex + 1].indexOf(next),
      });
    }
  }
}

function calculateCrossings(connections: Array<Connection>): number {
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

type Connection = {
  sourcePos: number;
  targetPos: number;
};

type ElementArrows = {
  incoming: Connection[];
  outgoing: Connection[];
};

type LayerInfoParameter = {
  layerIndex: number;
  index: number;
};
