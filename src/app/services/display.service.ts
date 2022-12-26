import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Coordinates } from '../classes/diagram/coordinates';
import { getEmptyNet } from '../classes/diagram/functions/net-helper.fn';
import { PartialOrder } from '../classes/diagram/partial-order';
import { isRunEmpty, PetriNet } from '../classes/diagram/petri-net';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  private petriNet$: BehaviorSubject<PetriNet>;
  private partialOrders$: BehaviorSubject<PartialOrder[]>;

  private reset$: BehaviorSubject<Coordinates>;

  constructor() {
    const emptyRun = getEmptyNet();
    this.petriNet$ = new BehaviorSubject<PetriNet>(emptyRun);
    this.partialOrders$ = new BehaviorSubject<PartialOrder[]>([]);

    this.reset$ = new BehaviorSubject<Coordinates>({ x: 0, y: 0 });
  }

  public getPetriNet$(): Observable<PetriNet> {
    return this.petriNet$.asObservable();
  }

  isCurrentRunEmpty$(): Observable<boolean> {
    return this.petriNet$.pipe(map((run) => isRunEmpty(run)));
  }

  setNewNet(newSource: PetriNet): void {
    this.petriNet$.next(newSource);
  }

  appendNewPartialOrder(partialOrder: PartialOrder): void {
    const currentList = this.partialOrders$.value;
    currentList.push(partialOrder);
    this.partialOrders$.next(currentList);
  }

  getPartialOrders$(): Observable<PartialOrder[]> {
    return this.partialOrders$.asObservable();
  }
}
