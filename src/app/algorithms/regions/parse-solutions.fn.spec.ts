import { ParsableSolution } from '../../services/repair/repair.model';
import { AutoRepair, parseSolution } from './parse-solutions.fn';

describe('parseSolution', () => {
  it('should return an empty array if no solutions are provided', () => {
    const parameter: ParsableSolution[] = [];

    const actual = parseSolution(parameter);

    const expected: AutoRepair | null = null;
    expect(actual).toEqual(expected);
  });

  it('should return marking for increase-marking', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'increase-marking',
        newMarking: 10,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'marking',
      newMarking: 10,
    };
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      incoming: [{ transitionId: 't1', weight: 3 }],
      outgoing: [],
    };
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single outgoing arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      incoming: [],
      outgoing: [{ transitionId: 't1', weight: 3 }],
    };
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and outgoing arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      incoming: [{ transitionId: 't1', weight: 3 }],
      outgoing: [{ transitionId: 't1', weight: 3 }],
    };
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and multiple outgoing arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      incoming: [{ transitionId: 't1', weight: 3 }],
      outgoing: [{ transitionId: 't1', weight: 6 }],
    };
    expect(actual).toEqual(expected);
  });

  it('should return modify place for multiple incoming and single outgoing arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'increase-marking',
        newMarking: 10,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      newMarking: 10,
      incoming: [{ transitionId: 't1', weight: 6 }],
      outgoing: [{ transitionId: 't1', weight: 3 }],
    };
    expect(actual).toEqual(expected);
  });

  it('should return replace place for multiple incoming and outgoing arc', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't2',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'replace-place',
      places: [
        {
          incoming: [{ transitionId: 't1', weight: 3 }],
          outgoing: [{ transitionId: 't1', weight: 3 }],
        },
        {
          incoming: [{ transitionId: 't1', weight: 3 }],
          outgoing: [{ transitionId: 't2', weight: 3 }],
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should return replace state for outgoing arcs the same', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't2',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'replace-place',
      places: [
        {
          incoming: [{ transitionId: 't1', weight: 3 }],
          outgoing: [{ transitionId: 't1', weight: 3 }],
        },
        {
          incoming: [{ transitionId: 't2', weight: 3 }],
          outgoing: [{ transitionId: 't1', weight: 3 }],
        },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should merge everything together if too same incoming elements', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't2',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      type: 'modify-place',
      incoming: [{ transitionId: 't1', weight: 9 }],
      outgoing: [
        { transitionId: 't1', weight: 3 },
        { transitionId: 't2', weight: 3 },
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should merge everything together if too same outgoing elements', () => {
    const parameter: ParsableSolution[] = [
      {
        type: 'incoming-arc',
        incoming: 't1',
        marking: 3,
      },
      {
        type: 'incoming-arc',
        incoming: 't2',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
      {
        type: 'outgoing-arc',
        outgoing: 't1',
        marking: 3,
      },
    ];

    const actual = parseSolution(parameter);

    const expected: AutoRepair = {
      incoming: [
        { transitionId: 't1', weight: 3 },
        { transitionId: 't2', weight: 3 },
      ],
      outgoing: [{ transitionId: 't1', weight: 9 }],
      type: 'modify-place',
    };
    expect(actual).toEqual(expected);
  });
});
