import { CustomEvent } from './event';
import { EventLogAttribute } from './eventlogattribute';

export class Trace {
  private _attributes: Array<EventLogAttribute>;
  private _events: Array<CustomEvent>;
  private _caseId: number;

  public get attributes(): Array<EventLogAttribute> {
    return this._attributes;
  }
  public set attributes(value: Array<EventLogAttribute>) {
    this._attributes = value;
  }

  public get events(): Array<CustomEvent> {
    return this._events;
  }
  public set events(value: Array<CustomEvent>) {
    this._events = value;
  }

  public get caseId(): number {
    return this._caseId;
  }
  public set caseId(value: number) {
    this._caseId = value;
  }

  constructor(
    attributes: Array<EventLogAttribute>,
    events: Array<CustomEvent>,
    caseId: number
  ) {
    this._attributes = attributes;
    this._events = events;
    this._caseId = caseId;
  }
}
