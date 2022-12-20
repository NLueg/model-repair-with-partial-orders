import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Coordinates, CoordinatesInfo } from '../classes/diagram/coordinates';
import { getEmptyNet } from '../classes/diagram/functions/net-helper.fn';
import { PartialOrder } from '../classes/diagram/partial-order';
import { isRunEmpty, PetriNet } from '../classes/diagram/petri-net';
import { parsedSimpleExampleLogInvalid } from './upload/simple-example/simple-example-parsed';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  private petriNet$: BehaviorSubject<PetriNet>;
  private partialOrders$: BehaviorSubject<PartialOrder[]>;

  private coordinatesInfo$: BehaviorSubject<Array<CoordinatesInfo>>;

  private reset$: BehaviorSubject<Coordinates>;

  constructor() {
    const emptyRun = getEmptyNet();
    this.petriNet$ = new BehaviorSubject<PetriNet>(emptyRun);
    this.partialOrders$ = new BehaviorSubject<PartialOrder[]>([
      parsedSimpleExampleLogInvalid,
    ]);

    this.reset$ = new BehaviorSubject<Coordinates>({ x: 0, y: 0 });
    this.coordinatesInfo$ = new BehaviorSubject<Array<CoordinatesInfo>>([
      {
        transitionName: '',
        transitionType: '',
        coordinates: {
          x: 0,
          y: 0,
        },
        globalOffset: {
          x: 0,
          y: 0,
        },
      },
    ]);
  }

  public setCoordsInfo(coordsInfos: Array<CoordinatesInfo>): void {
    this.coordinatesInfo$.next(coordsInfos);
  }

  public coordsInfoAdded(): Observable<CoordinatesInfo[]> {
    return this.coordinatesInfo$.asObservable();
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
