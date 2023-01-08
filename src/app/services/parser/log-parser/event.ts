import { EventLogAttribute } from './eventlogattribute';

export class CustomEvent {
  private _attributes: Array<EventLogAttribute>;
  private _activity: string;

  public get attributes(): Array<EventLogAttribute> {
    return this._attributes;
  }
  public set attributes(value: Array<EventLogAttribute>) {
    this._attributes = value;
  }

  public get activity(): string {
    return this._activity;
  }

  public set activity(value: string) {
    this._activity = value;
  }

  public getAttribute(key: string): EventLogAttribute {
    return this._attributes.filter(
      (attribute) => key === attribute.key.toString()
    )[0];
  }

  constructor(attributes: Array<EventLogAttribute>, activity: string) {
    this._activity = activity;
    this._attributes = attributes;
  }
}
