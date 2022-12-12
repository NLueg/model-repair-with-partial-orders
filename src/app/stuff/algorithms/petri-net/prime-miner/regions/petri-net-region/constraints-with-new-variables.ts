import { SubjectTo } from '../../../../../models/glpk/subject-to';

export class ConstraintsWithNewVariables {
  private readonly _constraints: Array<SubjectTo>;

  constructor(constraints: SubjectTo | Array<SubjectTo>) {
    this._constraints = Array.isArray(constraints)
      ? constraints
      : [constraints];
  }

  get constraints(): Array<SubjectTo> {
    return this._constraints;
  }

  public static combine(
    ...constraints: Array<ConstraintsWithNewVariables>
  ): ConstraintsWithNewVariables {
    return new ConstraintsWithNewVariables(
      constraints.reduce((a, v) => {
        a.push(...v.constraints);
        return a;
      }, [] as Array<SubjectTo>)
    );
  }

  public static combineAndIntroduceVariables(
    newBinaryVariables?: string | Array<string>,
    newIntegerVariables?: string | Array<string>,
    ...constraints: Array<ConstraintsWithNewVariables>
  ): ConstraintsWithNewVariables {
    return ConstraintsWithNewVariables.combine(
      new ConstraintsWithNewVariables([]),
      ...constraints
    );
  }
}
