export class Classifier {
  private _name: string;
  private _keys: Array<string>;

  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }
  public get keys(): Array<string> {
    return this._keys;
  }
  public set keys(value: Array<string>) {
    this._keys = value;
  }

  constructor(name: string, keys: Array<string>) {
    this._name = name;
    this._keys = keys;
  }
}
