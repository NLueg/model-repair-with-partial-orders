import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import clonedeep from 'lodash.clonedeep';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { FirePartialOrder } from '../../algorithms/fire-partial-orders/fire-partial-order';
import { PetriNetSolutionService } from '../../algorithms/regions/petri-net-solution.service';
import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { DisplayService } from '../../services/display.service';
import {
  LayoutResult,
  LayoutService,
} from '../../services/layout/layout.service';
import {
  NewTransitionSolution,
  PlaceSolution,
} from '../../services/repair/repair.model';
import { RepairService } from '../../services/repair/repair.service';
import { SvgService } from '../../services/svg/svg.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements OnInit {
  @Input()
  resetSvgPosition?: Observable<void>;

  computingSolutions = false;

  layoutResult$?: Observable<LayoutResult & { renderChanges: boolean }>;
  @ViewChild('canvas') canvas: CanvasComponent | undefined;
  @ViewChild('svg_wrapper') svgWrapper: ElementRef<HTMLElement> | undefined;

  invalidPlaceCount$: Subject<{ count: number } | null>;

  tracesCount$: Observable<number>;
  transitionSolutions$: Observable<NewTransitionSolution[]>;

  constructor(
    private layoutService: LayoutService,
    private svgService: SvgService,
    private displayService: DisplayService,
    private petriNetRegionsService: PetriNetSolutionService,
    private repairService: RepairService
  ) {
    this.invalidPlaceCount$ = new BehaviorSubject<{ count: number } | null>(
      null
    );

    this.transitionSolutions$ = repairService
      .getSolutions$()
      .pipe(
        map(
          (solutions) =>
            solutions.filter(
              (s) => s.type === 'newTransition'
            ) as NewTransitionSolution[]
        )
      );

    this.tracesCount$ = this.displayService.getPartialOrders$().pipe(
      map((partialOrders) => partialOrders?.length ?? 0),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
    this.layoutResult$ = this.displayService.getPetriNet$().pipe(
      switchMap((net) =>
        this.displayService.getPartialOrders$().pipe(
          startWith([]),
          switchMap((partialOrders) => {
            if (!partialOrders || partialOrders.length === 0) {
              this.repairService.saveNewSolutions([], 0);
              return of({ solutions: [], renderChanges: true });
            }

            this.computingSolutions = true;
            const invalidPlaces: {
              [key: string]: number;
            } = {};
            for (let index = 0; index < partialOrders.length; index++) {
              const currentInvalid = this.firePartialOrder(
                net,
                partialOrders[index]
              );

              currentInvalid.forEach((place) => {
                if (invalidPlaces[place] === undefined) {
                  invalidPlaces[place] = 0;
                }
                invalidPlaces[place]++;
              });
            }

            const placeIds = Object.keys(invalidPlaces);
            this.invalidPlaceCount$.next({
              count: placeIds.length,
            });

            const places: Place[] = net.places.filter((place) =>
              placeIds.includes(place.id)
            );
            net.places.forEach((place) => {
              place.issueStatus = undefined;
            });
            places.forEach((invalidPlace) => {
              invalidPlace.issueStatus = 'error';
            });

            return this.petriNetRegionsService
              .computeSolutions(partialOrders, net, invalidPlaces)
              .pipe(
                tap(() => (this.computingSolutions = false)),
                map((solutions) => ({
                  solutions,
                  renderChanges: false,
                })),
                startWith({
                  solutions: [] as PlaceSolution[],
                  renderChanges: false,
                })
              );
          }),
          map(({ solutions, renderChanges }) => {
            for (const place of solutions) {
              if (place.type === 'newTransition') {
                continue;
              }
              const foundPlace = net.places.find((p) => p.id === place.place);
              if (foundPlace) {
                foundPlace.issueStatus = place.type;
              }
            }
            return { net, renderChanges };
          }),
          switchMap(({ net, renderChanges }) =>
            (this.resetSvgPosition
              ? this.resetSvgPosition.pipe(
                  startWith(undefined),
                  map(() => this.layoutService.layout(clonedeep(net)))
                )
              : of(this.layoutService.layout(clonedeep(net)))
            ).pipe(map((result) => ({ ...result, renderChanges })))
          )
        )
      )
    );
  }

  private firePartialOrder(
    petriNet: PetriNet,
    partialOrder: PartialOrder
  ): string[] {
    return new FirePartialOrder(petriNet, partialOrder).getInvalidPlaces();
  }

  applySolution(solution: NewTransitionSolution, button: MatButton): void {
    const domRect: DOMRect =
      button._elementRef.nativeElement.getBoundingClientRect();
    this.repairService.showRepairPopoverForSolution(domRect, solution);
  }
}
