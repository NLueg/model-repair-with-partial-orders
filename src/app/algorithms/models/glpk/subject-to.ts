import { Bound } from './bound';
import { Variable } from './variable';

export type SubjectTo = {
  name: string;
  vars: Array<Variable>;
  bnds: Bound;
};
