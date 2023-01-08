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
  private partialOrders$: BehaviorSubject<PartialOrder[]>;

  private reset$: BehaviorSubject<Coordinates>;

  constructor() {
    const net = getEmptyNet();
    this.petriNet$ = new BehaviorSubject<PetriNet>(net);
    this.partialOrders$ = new BehaviorSubject<PartialOrder[]>([
      ...this.parserService.parsePartialOrders(
        '.type log\n' +
          '.attributes\n' +
          'case-id\n' +
          'concept:name\n' +
          'event-id\n' +
          'follows[]\n' +
          '.events\n' +
          '1 a e1\n' +
          '1 b e2 [e1]\n' +
          '1 c e3 [e1]\n' +
          '1 d e4 [e2,e3]\n' +
          '2 x e5\n' +
          '2 b e6 [e5]\n' +
          '2 c e7 [e5]\n' +
          '2 d e8 [e6,e7]',
        new Set<string>()
      )!,
      /* this.parserService.parsePartialOrder(
        '.type log\n' +
          '.events\n' +
          'e2 b\n' +
          'e3 c\n' +
          'e4 x\n' +
          '.arcs\n' +
          'e4 e2\n' +
          'e4 e3\n',
        new Set<string>()
      )!, */
    ]);
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

  appendNewPartialOrder(partialOrder: PartialOrder[]): void {
    const currentList = this.partialOrders$.value;
    currentList.push(...partialOrder);
    this.partialOrders$.next(currentList);
  }

  getPartialOrders$(): Observable<PartialOrder[]> {
    return this.partialOrders$.asObservable();
  }
}
