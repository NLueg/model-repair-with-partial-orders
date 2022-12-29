import { AutoRepair } from '../../algorithms/regions/parse-solutions.fn';

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

// TODO: Make it possible to have multiple solutions
export type PlaceSolution = {
  place: string;
  solutions: AutoRepair | null;
  invalidTraceCount: number;
};
