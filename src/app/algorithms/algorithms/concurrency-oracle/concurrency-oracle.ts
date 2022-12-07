import { ConcurrencyRelation } from '../../models/concurrency/model/concurrency-relation';
import { Trace } from '../../models/log/model/trace';

export interface ConcurrencyOracle {
  determineConcurrency(log: Array<Trace>): ConcurrencyRelation;
}
