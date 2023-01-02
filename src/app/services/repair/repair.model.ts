import { SolutionType } from '../../algorithms/regions/ilp-solver/solver-classes';
import { AutoRepairWithSolutionType } from '../../algorithms/regions/parse-solutions.fn';

export type ParsableSolution =
  | {
      type: 'increase-marking';
      newMarking: number;
    }
  | {
      type: 'incoming-arc';
      incoming: string;
      marking: number;
    }
  | {
      type: 'outgoing-arc';
      outgoing: string;
      marking: number;
    };

export type ParsableSolutionsPerType = {
  type: SolutionType;
  solutionParts: ParsableSolution[];
};

export type PlaceSolution = {
  place: string;
  solutions: AutoRepairWithSolutionType[];
  invalidTraceCount: number;
  missingTokens: number | undefined;
};
