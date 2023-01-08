import { Classifier } from './classifier';
import { EventLogAttribute } from './eventlogattribute';
import { Trace } from './trace';

export class EventLog {
  private _classifiers: Array<Classifier>;
  private _globalEventAttributes: Array<EventLogAttribute>;
  private _globalTraceAttributes: Array<EventLogAttribute>;
  private _attributes: Array<EventLogAttribute>;
  private _traces: Array<Trace>;

  public get classifiers(): Array<Classifier> {
    return this._classifiers;
  }
  public set classifiers(value: Array<Classifier>) {
    this._classifiers = value;
  }

  public get globalEventAttributes(): Array<EventLogAttribute> {
    return this._globalEventAttributes;
  }
  public set globalEventAttributes(value: Array<EventLogAttribute>) {
    this._globalEventAttributes = value;
  }

  public get globalTraceAttributes(): Array<EventLogAttribute> {
    return this._globalTraceAttributes;
  }
  public set globalTraceAttributes(value: Array<EventLogAttribute>) {
    this._globalTraceAttributes = value;
  }

  public get attributes(): Array<EventLogAttribute> {
    return this._attributes;
  }
  public set attributes(value: Array<EventLogAttribute>) {
    this._attributes = value;
  }

  public get traces(): Array<Trace> {
    return this._traces;
  }

  public set traces(value: Array<Trace>) {
    this._traces = value;
  }

  public get sortedTraces(): Array<Array<Trace>> {
    const result = new Array<Array<Trace>>();

    this._traces.forEach((trace) => {
      const index = result.findIndex((val) => {
        for (let i = 0; i < val[0].events.length; i++) {
          if (val[0].events.length !== trace.events.length) {
            return false;
          }
          if (val[0].events[i].activity !== trace.events[i].activity) {
            return false;
          }
        }
        return true;
      });
      if (index == -1) {
        const arr = new Array<Trace>();
        arr.push(trace);
        result.push(arr);
      } else {
        result[index].push(trace); // Trace zu den anderen hinzufügen die die gleichen Events haben
      }
    });
    result.sort((a, b) => {
      return b.length - a.length;
    });
    return result;
  }

  constructor(
    classifiers: Array<Classifier>,
    globalEventAttributes: Array<EventLogAttribute>,
    globalTraceAttributes: Array<EventLogAttribute>,
    traces: Array<Trace>,
    attributes: Array<EventLogAttribute>
  ) {
    this._classifiers = classifiers;
    this._globalEventAttributes = globalEventAttributes;
    this._globalTraceAttributes = globalTraceAttributes;
    this._attributes = attributes;
    this._traces = traces;
  }
}
