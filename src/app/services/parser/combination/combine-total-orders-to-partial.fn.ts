import clonedeep from 'lodash.clonedeep';

import { Arc } from '../../../classes/diagram/arc';
import { PartialOrder } from '../../../classes/diagram/partial-order';
import { EventItem } from '../../../classes/diagram/transition';
import { arcsAttribute, eventsAttribute } from '../parsing-constants';
import { determineConcurrency } from './ilpn/alpha-oracle.service';
import { transformToPartialOrders } from './ilpn/log-to-partial-order-transform.fn';
import { serializePn } from './ilpn/serializer/serialize.fn';

export function combineTotalOrdersToPartial(
  totalOrders: PartialOrder[]
): PartialOrder {
  const concurrency = determineConcurrency(totalOrders);

  const transformedStuff = transformToPartialOrders(totalOrders, concurrency);

  const serialized3 = Array.from(transformedStuff).map((sequence) =>
    serializePn(sequence.net)
  );
  console.error(mergeRuns(totalOrders));

  const result = generateTextForRun(mergeRuns(totalOrders));
  console.error(result);

  return totalOrders[0];
}

function mergeRuns(partialOrder: PartialOrder[]): PartialOrder {
  const primeEventStructure: PartialOrder = {
    events: [],
    arcs: [],
  };
  let nextArcs: Array<Arc> = [];
  let nextElements: Array<EventItem> = [];
  /* erstelle einen neunen Run, und füge alle Events und Arcs hinzu.
  Um sicher zu stellen, dass die IDs eindeutig sind werden diese erneuert als
  Kombination von Index und alter ID */
  if (partialOrder.length === 0) {
    return primeEventStructure;
  }

  for (let index = 0; index < partialOrder.length; index++) {
    const runToMerge = clonedeep(partialOrder[index]);
    runToMerge.events.forEach(
      (element) => (element.id = index + '_' + element.id)
    );
    runToMerge.arcs.forEach((arc) => {
      arc.source = index + '_' + arc.source;
      arc.target = index + '_' + arc.target;
    });
    primeEventStructure.events.push(...runToMerge.events);
    primeEventStructure.arcs.push(...runToMerge.arcs);
  }
  let end = false;
  let first = true;
  /*Jetzt werden die Layer nacheinander Durchgegangen und geprüft ob es zwei
    Elemente gibt, welche das gleiche Label besitzen und alle einsteffen Arcs übereinstimmen.
    Diese werden gemerged, es sei denn sie stammen aus demselben Run und sollen somit Nebenläufig sein*/
  while (!end) {
    if (first) {
      /*Am Anfang wird der erste Layer bearbeitet*/
      primeEventStructure.events.forEach((element) => {
        if (element.incomingArcs.length == 0) {
          nextElements.push(element);
        }
      });
    } else {
      /* der nächste Layer besteht aus denjenige Elementen, bei denen alle Incoming Arcs bereits besucht
        wurden */
      primeEventStructure.events.forEach((element) => {
        let allIncomingArcs = true;
        if (element.incomingArcs.length > 0) {
          for (let index = 0; index < element.incomingArcs.length; index++) {
            if (!nextArcs.includes(element.incomingArcs[index])) {
              allIncomingArcs = false;
            }
          }
          if (allIncomingArcs) {
            nextElements.push(element);
            element.incomingArcs.forEach((arc) => {
              nextArcs = nextArcs.filter((arc2) => arc != arc2);
            });
          }
        }
      });
    }

    if (nextElements.length > 1) {
      /* Um die Ausnahme zu berücksichtigen, dass zwei Elemente aus einem Run stammen und diese gemerged werden
        werden alle label bis auch den ersten provisorisch geändert */
      for (let index = 0; index < nextElements.length - 1; index++) {
        for (let index2 = index + 1; index2 < nextElements.length; index2++) {
          if (
            nextElements[index].label == nextElements[index2].label &&
            haveSameIncomingArcs(nextElements[index], nextElements[index2])
          ) {
            if (
              nextElements[index].id.split('_')[0] ==
              nextElements[index2].id.split('_')[0]
            ) {
              nextElements[index2].label = nextElements[index2].label + '|';
            }
          }
        }
      }
    }
    /* Es folgt der eigentliche Merge Prozess */
    for (let index = 0; index < nextElements.length - 1; index++) {
      for (let index2 = index + 1; index2 < nextElements.length; index2++) {
        if (
          nextElements[index].label == nextElements[index2].label &&
          haveSameIncomingArcs(nextElements[index], nextElements[index2])
        ) {
          nextElements[index2].outgoingArcs.forEach((arc) => {
            arc.source = nextElements[index].id;
            nextElements[index].outgoingArcs.push(arc);
          });

          /*arcs die auf gemergte elements elements zeigen werden entfernt */
          primeEventStructure.arcs = primeEventStructure.arcs.filter(
            (arc) => arc.target != nextElements[index2].id
          );
          /*gemergte elements werden entfernt */
          primeEventStructure.events = primeEventStructure.events.filter(
            (element) => element != nextElements[index2]
          );

          nextElements = nextElements.filter(
            (element) => element != nextElements[index2]
          );
          index2 = index2 - 1;
        }
      }
    }

    /*outgoing Arcs werden besucht */
    nextElements.forEach((element) => {
      element.outgoingArcs.forEach((arc) => {
        nextArcs.push(arc);
      });
    });

    nextElements = [];

    /*Schleife ist beendet sobald keine Kanten (outgoing Arcs) mehr besucht werden können*/
    if (nextArcs.length == 0) {
      end = true;
    }
    first = false;
  }
  /*provisorische Label werden wieder zurückgesetzt  */
  primeEventStructure.events.forEach((element) => {
    element.label = element.label.split('|')[0];
  });
  // setRefs(primeEventStructure);
  return primeEventStructure;
}

function haveSameIncomingArcs(
  element1: EventItem,
  element2: EventItem
): boolean {
  let haveSame = true;
  element1.incomingArcs.forEach((arc1) => {
    if (
      element2.incomingArcs.filter((arc2) => arc2.source === arc1.source)
        .length == 0
    ) {
      haveSame = false;
    }
  });
  if (haveSame) {
    element2.incomingArcs.forEach((arc2) => {
      if (
        element1.incomingArcs.filter((arc1) => arc2.source === arc1.source)
          .length == 0
      ) {
        haveSame = false;
      }
    });
  }
  return haveSame;
}

function generateTextForRun(run: PartialOrder): string {
  const lines = [`.type log`];
  lines.push(eventsAttribute);
  run.events.forEach((e) => {
    const identifier = e.label === e.id ? e.id : `${e.id + ' | ' + e.label}`;
    lines.push(identifier);
  });

  lines.push(arcsAttribute);
  lines.push(
    ...run.arcs
      .filter((arc) => {
        const source = run.events.find((element) => element.id === arc.source);
        const target = run.events.find((element) => element.id === arc.target);
        return source && target;
      })
      .map((arc) => arc.source + ' ' + arc.target)
  );
  return lines.join('\n');
}
