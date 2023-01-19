import { ParsableSolutionsPerType } from '../../services/repair/repair.model';
import {
  AutoRepairWithSolutionType,
  parseSolution,
} from './parse-solutions.fn';

describe('parseSolution', () => {
  it('should return an empty array if no solutions are provided', () => {
    const parameter: ParsableSolutionsPerType[] = [];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [];
    expect(actual).toEqual(expected);
  });

  it('should return marking for increase-marking', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
            {
              type: 'increase-marking',
              newMarking: 10,
            },
          ],
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'marking',
        repairType: 'multiplePlaces',
        newMarking: 10,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
            {
              type: 'incoming-arc',
              incoming: 't1',
              marking: 3,
            },
          ],
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        incoming: [{ transitionLabel: 't1', weight: 3 }],
        outgoing: [],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
            {
              type: 'outgoing-arc',
              outgoing: 't1',
              marking: 3,
            },
          ],
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        incoming: [],
        outgoing: [{ transitionLabel: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        incoming: [{ transitionLabel: 't1', weight: 3 }],
        outgoing: [{ transitionLabel: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for single incoming and multiple outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        incoming: [{ transitionLabel: 't1', weight: 3 }],
        outgoing: [{ transitionLabel: 't1', weight: 6 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return modify place for multiple incoming and single outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        newMarking: 10,
        incoming: [{ transitionLabel: 't1', weight: 6 }],
        outgoing: [{ transitionLabel: 't1', weight: 3 }],
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should return replace place for multiple incoming and outgoing arc', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'replace-place',
        repairType: 'multiplePlaces',
        places: [
          {
            incoming: [{ transitionLabel: 't1', weight: 3 }],
            outgoing: [{ transitionLabel: 't1', weight: 3 }],
          },
          {
            incoming: [{ transitionLabel: 't1', weight: 3 }],
            outgoing: [{ transitionLabel: 't2', weight: 3 }],
          },
        ],
      },
    ];
    expect(actual).toEqual(expected);
  });

  // TODO: Check this test case again
  it('should return replace state for outgoing arcs the same', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'replace-place',
        repairType: 'multiplePlaces',
        places: [
          {
            incoming: [{ transitionLabel: 't1', weight: 3 }],
            outgoing: [{ transitionLabel: 't1', weight: 3 }],
          },
          {
            incoming: [{ transitionLabel: 't2', weight: 3 }],
            outgoing: [{ transitionLabel: 't1', weight: 3 }],
          },
        ],
      },
    ];
    expect(actual).toEqual(expected);
  });

  // TODO: Check this test case again
  it('should merge everything together if too same incoming elements', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        type: 'modify-place',
        repairType: 'multiplePlaces',
        incoming: [{ transitionLabel: 't1', weight: 9 }],
        outgoing: [
          { transitionLabel: 't1', weight: 3 },
          { transitionLabel: 't2', weight: 3 },
        ],
      },
    ];
    expect(actual).toEqual(expected);
  });

  // TODO: Check this test case again
  it('should merge everything together if same outgoing elements', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'multiplePlaces',
        solutionParts: [
          [
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
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        repairType: 'multiplePlaces',
        incoming: [
          { transitionLabel: 't1', weight: 3 },
          { transitionLabel: 't2', weight: 3 },
        ],
        outgoing: [{ transitionLabel: 't1', weight: 9 }],
        type: 'modify-place',
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('should should return empty list for no solution parts', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'changeMarking',
        solutionParts: [],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [];
    expect(actual).toEqual(expected);
  });

  it('should generate replace-place for example by kovar', () => {
    const parameter: ParsableSolutionsPerType[] = [
      {
        type: 'changeMarking',
        solutionParts: [
          [
            {
              type: 'incoming-arc',
              incoming: 'a',
              marking: 1,
            },
            {
              type: 'outgoing-arc',
              outgoing: 'b',
              marking: 1,
            },
            {
              type: 'incoming-arc',
              incoming: 'x',
              marking: 1,
            },
          ],
          [
            {
              type: 'incoming-arc',
              incoming: 'a',
              marking: 1,
            },
            {
              type: 'outgoing-arc',
              outgoing: 'b',
              marking: 1,
            },
            {
              type: 'incoming-arc',
              incoming: 'x',
              marking: 1,
            },
          ],
          [
            {
              type: 'incoming-arc',
              incoming: 'a',
              marking: 1,
            },
            {
              type: 'outgoing-arc',
              outgoing: 'c',
              marking: 1,
            },
            {
              type: 'incoming-arc',
              incoming: 'x',
              marking: 1,
            },
          ],
          [
            {
              type: 'incoming-arc',
              incoming: 'a',
              marking: 1,
            },
            {
              type: 'outgoing-arc',
              outgoing: 'c',
              marking: 1,
            },
            {
              type: 'incoming-arc',
              incoming: 'x',
              marking: 1,
            },
          ],
        ],
      },
    ];

    const actual = parseSolution(parameter, undefined, {});

    const expected: AutoRepairWithSolutionType[] = [
      {
        places: [
          {
            incoming: [
              {
                transitionLabel: 'a',
                weight: 1,
              },
              {
                transitionLabel: 'x',
                weight: 1,
              },
            ],
            outgoing: [
              {
                transitionLabel: 'b',
                weight: 1,
              },
            ],
          },
          {
            incoming: [
              {
                transitionLabel: 'a',
                weight: 1,
              },
              {
                transitionLabel: 'x',
                weight: 1,
              },
            ],
            outgoing: [
              {
                transitionLabel: 'b',
                weight: 1,
              },
            ],
          },
          {
            incoming: [
              {
                transitionLabel: 'a',
                weight: 1,
              },
              {
                transitionLabel: 'x',
                weight: 1,
              },
            ],
            outgoing: [
              {
                transitionLabel: 'c',
                weight: 1,
              },
            ],
          },
          {
            incoming: [
              {
                transitionLabel: 'a',
                weight: 1,
              },
              {
                transitionLabel: 'x',
                weight: 1,
              },
            ],
            outgoing: [
              {
                transitionLabel: 'c',
                weight: 1,
              },
            ],
          },
        ],
        repairType: 'changeMarking',
        type: 'replace-place',
      },
    ];
    expect(actual).toEqual(expected);
  });
});
