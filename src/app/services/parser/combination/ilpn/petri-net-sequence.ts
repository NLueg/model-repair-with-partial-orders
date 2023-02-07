import clonedeep from 'lodash.clonedeep';

import { LogEvent } from './model/logEvent';
import { PetriNet } from './model/petri-net';
import { Place } from './model/place';
import { Trace } from './model/trace';
import { Transition } from './model/transition';

export class PetriNetSequence {
  private _net: PetriNet;
  private _lastPlace: Place;
  private _trace: Trace;

  constructor() {
    this._net = new PetriNet();
    this._lastPlace = new Place();
    this._net.addPlace(this._lastPlace);
    this._trace = new Trace();
  }

  get net(): PetriNet {
    return this._net;
  }

  get trace(): Trace {
    return this._trace;
  }

  public clone(): PetriNetSequence {
    const clone = new PetriNetSequence();
    clone._net = this._net.clone();
    clone._lastPlace = clone._net.getPlace(this._lastPlace.getId())!;
    clone._trace = clonedeep(this._trace);
    return clone;
  }

  public appendEvent(label: string): void {
    this._trace.events.push(new LogEvent(label));
    this.appendTransition(label);
  }

  public appendTransition(label: string): void {
    const t = new Transition(label);
    this._net.addTransition(t);
    this._net.addArc(this._lastPlace, t);
    this._lastPlace = new Place();
    this._net.addPlace(this._lastPlace);
    this._net.addArc(t, this._lastPlace);
  }
}
