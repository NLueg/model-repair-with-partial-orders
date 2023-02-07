import { PartialOrder } from '../../../../classes/diagram/partial-order';
import { Multiset } from './multiset';
import { MultisetEquivalent } from './multiset-equivalent';

export class MultisetEquivalentTraces extends MultisetEquivalent {
  public traces: Array<PartialOrder> = [];
  public count = 0;

  constructor(multiset: Multiset) {
    super(multiset);
  }

  public addTrace(trace: PartialOrder) {
    this.traces.push(trace);
    this.incrementCount();
  }

  public incrementCount() {
    this.count++;
  }

  merge(ms: MultisetEquivalentTraces): void {
    this.traces.push(...ms.traces);
  }
}
