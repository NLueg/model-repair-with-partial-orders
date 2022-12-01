import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Coordinates, CoordinatesInfo } from '../classes/diagram/coordinates';
import { getEmptyNet } from '../classes/diagram/functions/net-helper.fn';
import { isRunEmpty, PetriNet } from '../classes/diagram/petri-net';

@Injectable({
  providedIn: 'root',
})
export class DisplayService implements OnDestroy {
  private petriNet$: BehaviorSubject<PetriNet>;

  private coordinatesInfo$: BehaviorSubject<Array<CoordinatesInfo>>;

  private reset$: BehaviorSubject<Coordinates>;

  constructor() {
    const emptyRun = getEmptyNet();
    this.petriNet$ = new BehaviorSubject<PetriNet>(emptyRun);

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

  ngOnDestroy(): void {
    this.petriNet$.complete();
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

  public addEmptyRun(): PetriNet {
    this.petriNet$.next(getEmptyNet());
    return this.petriNet$.getValue();
  }

  isCurrentRunEmpty$(): Observable<boolean> {
    return this.petriNet$.pipe(map((run) => isRunEmpty(run)));
  }

  setNewNet(newSource: PetriNet): void {
    this.petriNet$.next(newSource);
  }
}
