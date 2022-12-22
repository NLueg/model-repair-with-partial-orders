export type AutoSolution =
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

export type PlaceSolutions = { place: string; solutions: AutoSolution[] };
