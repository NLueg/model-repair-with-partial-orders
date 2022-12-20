import { Constraint } from './glpk-constants';

export type Bound = {
  type: Constraint;
  /**
   * Upper bound
   */
  ub: number;
  /**
   * Lower bound
   */
  lb: number;
};
