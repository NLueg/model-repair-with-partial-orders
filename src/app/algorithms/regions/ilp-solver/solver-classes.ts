import { Constraint } from './solver-constants';

export type SubjectTo = {
  name: string;
  vars: Array<Variable>;
  bnds: Bound;
};

export type Variable = {
  name: string;
  coef: number;
};

export type Bound = {
  type: Constraint;
  ub: number;
  lb: number;
};
