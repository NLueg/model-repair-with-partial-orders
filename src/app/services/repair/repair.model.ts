import { SolutionType } from '../../algorithms/regions/ilp-solver/solver-classes';
import { AutoRepairWithSolutionType } from '../../algorithms/regions/parse-solutions.fn';

export type ParsableSolution =
  | {
      type: 'increase-marking';
      newMarking: number;
    }
  | IncomingArcSolution
  | OutgoingArcSolution;

export type IncomingArcSolution = {
  type: 'incoming-arc';
  incoming: string;
  marking: number;
};

export type OutgoingArcSolution = {
  type: 'outgoing-arc';
  outgoing: string;
  marking: number;
};

export type ParsableSolutionsPerType = {
  type: SolutionType;
  solutionParts: ParsableSolution[][];
};

export type PlaceSolution =
  | {
      type: 'error';
      place: string;
      solutions: AutoRepairWithSolutionType[];
      invalidTraceCount: number;
      missingTokens: number | undefined;
    }
  | {
      type: 'warning';
      place: string;
      reduceTokensTo: number;
    };
