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

export type PlaceSolutions = { place: string; solutions: AutoRepair | null };
