import { ParsableSolutionsPerType } from '../../services/repair/repair.model';
import {
  AutoRepairWithSolutionType,
  parseSolution,
} from './parse-solutions.fn';

describe('parseSolution', () => {
  it('should return an empty array if no solutions are provided', () => {
    const parameter: ParsableSolutionsPerType[] = [];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [];
    expect(actual).toEqual(expected);
  });

  it('should return marking for increase-marking', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
          {
            type: 'increase-marking',
            newMarking: 10,
          },
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'marking',
        repairType: 'unbounded',
        newMarking: 10,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
          {
            type: 'incoming-arc',
            incoming: 't1',
            marking: 3,
          },
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        incoming: [{ transitionId: 't1', weight: 3 }],
        outgoing: [],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
          {
            type: 'outgoing-arc',
            outgoing: 't1',
            marking: 3,
          },
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        incoming: [],
        outgoing: [{ transitionId: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        incoming: [{ transitionId: 't1', weight: 3 }],
        outgoing: [{ transitionId: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and multiple outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        incoming: [{ transitionId: 't1', weight: 3 }],
        outgoing: [{ transitionId: 't1', weight: 6 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for multiple incoming and single outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        newMarking: 10,
        incoming: [{ transitionId: 't1', weight: 6 }],
        outgoing: [{ transitionId: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return replace place for multiple incoming and outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'replace-place',
        repairType: 'unbounded',
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
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return replace state for outgoing arcs the same', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'replace-place',
        repairType: 'unbounded',
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
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should merge everything together if too same incoming elements', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'unbounded',
        incoming: [{ transitionId: 't1', weight: 9 }],
        outgoing: [
          { transitionId: 't1', weight: 3 },
          { transitionId: 't2', weight: 3 },
        ],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should merge everything together if too same outgoing elements', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'unbounded',
        solutionParts: [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined);

    const expected: AutoRepairWithSolutionType[] = [
      {
        repairType: 'unbounded',
        incoming: [
          { transitionId: 't1', weight: 3 },
          { transitionId: 't2', weight: 3 },
        ],
        outgoing: [{ transitionId: 't1', weight: 9 }],
        type: 'modify-place',
      },
    ];
    expect(actual).toEqual(expected);
  });
});
