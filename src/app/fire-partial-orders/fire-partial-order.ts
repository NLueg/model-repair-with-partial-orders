import { EventLog } from '../classes/diagram/event-log';
import { PetriNet } from '../classes/diagram/petri-net';

export function firePartialOrder(
  petriNet: PetriNet,
  partialOrder: EventLog
): PetriNet {
  const newNet = { ...petriNet };
  partialOrder.transitions.forEach((transition) => {
    newNet.transitions.find((t) => t.name === transition.name).fired = true;
  });
  return newNet;
}
