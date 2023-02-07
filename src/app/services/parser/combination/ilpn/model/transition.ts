import { Node } from './node';

export class Transition extends Node {
  private _label: string | undefined;
  private _foldedPair?: Transition;

  constructor(label?: string, x = 0, y = 0, id?: string) {
    super(x, y, id);
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  set label(value: string | undefined) {
    this._label = value;
  }
}
