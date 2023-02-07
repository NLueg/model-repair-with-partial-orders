import { Transition } from './transition';

export interface StringSequence {
  get(i: number): string;
  length(): number;
}

export interface EditableStringSequence extends StringSequence {
  set(i: number, value: string): void;
}

export class EditableStringSequenceWrapper implements EditableStringSequence {
  private readonly _array: Array<Transition>;

  constructor(array: Array<Transition>) {
    this._array = array;
  }

  get(i: number): string {
    return this._array[i].label!;
  }

  length(): number {
    return this._array.length;
  }

  set(i: number, value: string): void {
    this._array[i].label = value;
  }
}
