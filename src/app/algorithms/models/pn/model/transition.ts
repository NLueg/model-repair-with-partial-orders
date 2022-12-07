import { EditableString } from '../../../utility/string-sequence';
import { Node } from './node';

export class Transition extends Node implements EditableString {
  private _label: string | undefined;

  constructor(label?: string, x = 0, y = 0, id?: string) {
    super(x, y, id);
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  get isSilent(): boolean {
    return this._label === undefined;
  }

  set label(value: string | undefined) {
    this._label = value;
  }

  getString(): string {
    const l = this.label;
    if (l === undefined) {
      throw new Error('Transition label is undefined');
    }
    return l;
  }

  setString(value: string): void {
    this.label = value;
  }
}
