import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay, Subject } from 'rxjs';

import { Coordinates } from '../classes/diagram/coordinates';
import { getEmptyNet } from '../classes/diagram/functions/net-helper.fn';
import { PartialOrder } from '../classes/diagram/partial-order';
import { isNetEmpty, PetriNet } from '../classes/diagram/petri-net';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  private petriNet$: Subject<PetriNet>;
  private currentErrors$: Subject<Set<string>>;
  private partialOrders$: Subject<PartialOrder[] | null>;

  private reset$: BehaviorSubject<Coordinates>;

  constructor() {
    const net = getEmptyNet();
    this.petriNet$ = new BehaviorSubject<PetriNet>(net);
    this.partialOrders$ = new BehaviorSubject<PartialOrder[] | null>(null);
    this.currentErrors$ = new BehaviorSubject<Set<string>>(new Set());

    this.reset$ = new BehaviorSubject<Coordinates>({ x: 0, y: 0 });
  }

  getCurrentErrors$(): Observable<Set<string>> {
    return this.currentErrors$.asObservable();
  }

  getPetriNet$(): Observable<PetriNet> {
    return this.petriNet$.asObservable();
  }

  isCurrentRunEmpty$(): Observable<boolean> {
    return this.petriNet$.pipe(
      map((run) => isNetEmpty(run)),
      shareReplay(1)
    );
  }

  setNewNet(newSource: PetriNet, errors: Set<string>): void {
    this.petriNet$.next(newSource);
    this.currentErrors$.next(errors);
  }

  setPartialOrders(partialOrder: PartialOrder[]): void {
    this.partialOrders$.next(partialOrder);
  }

  getPartialOrders$(): Observable<PartialOrder[] | null> {
    return this.partialOrders$.asObservable();
  }
}
