import { PartialOrder } from '../../../../classes/diagram/partial-order';
import { ConcurrencyRelation } from './concurrency-relation';
import { OccurenceMatrixType, OccurrenceMatrix } from './occurrence-matrix';
import { Relabeler } from './relabeler';

export function determineConcurrency(
  log: Array<PartialOrder>
): ConcurrencyRelation {
  if (log.length === 0) {
    return ConcurrencyRelation.noConcurrency();
  }

  const relabeler = new Relabeler();
  relabeler.relabelSequencesPreserveNonUniqueIdentities(log);

  const matrix = computeOccurrenceMatrix(log, OccurenceMatrixType.WILDCARD);

  return ConcurrencyRelation.fromOccurrenceMatrix(matrix, relabeler);
}

function computeOccurrenceMatrix(
  log: Array<PartialOrder>,
  matrixType: OccurenceMatrixType = OccurenceMatrixType.UNIQUE
): OccurrenceMatrix {
  const matrix = new OccurrenceMatrix(matrixType);

  for (const trace of log) {
    const prefix: Array<string> = [];
    for (const step of trace.events) {
      if (prefix.length > 1) {
        prefix.shift();
      }
      for (const e of prefix) {
        matrix.add(e, step.label);
      }
      prefix.push(step.label);
    }
  }

  console.debug(matrix);

  return matrix;
}
