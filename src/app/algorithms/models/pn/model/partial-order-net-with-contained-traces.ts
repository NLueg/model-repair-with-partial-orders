import { Trace } from '../../log/model/trace';
import { PetriNet } from './petri-net';

export class PartialOrderNetWithContainedTraces {
  constructor(public net: PetriNet, public containedTraces: Array<Trace>) {}
}
