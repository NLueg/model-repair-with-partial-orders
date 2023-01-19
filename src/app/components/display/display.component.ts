import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';

import { FirePartialOrder } from '../../algorithms/fire-partial-orders/fire-partial-order';
import { PetriNetSolutionService } from '../../algorithms/regions/petri-net-solution.service';
import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { LayoutResult, LayoutService } from '../../services/layout.service';
import { NewTransitionSolution } from '../../services/repair/repair.model';
import { RepairService } from '../../services/repair/repair.service';
import { SvgService } from '../../services/svg/svg.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent {
  layoutResult$: Observable<LayoutResult>;
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

    this.layoutResult$ = this.displayService.getPetriNet$().pipe(
      map((currentRun) => this.layoutService.layout(currentRun)),
      switchMap(({ net, point }) =>
        this.displayService.getPartialOrders$().pipe(
          switchMap((partialOrders) => {
            if (!partialOrders || partialOrders.length === 0) {
              this.repairService.saveNewSolutions([], 0);
              return of([]);
            }

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

            this.invalidPlaceCount$.next({
              count: Object.keys(invalidPlaces).length,
            });

            return this.petriNetRegionsService.computeSolutions(
              partialOrders,
              net,
              invalidPlaces
            );
          }),
          map((invalidPlaces) => {
            net.places.forEach((place) => {
              place.issueStatus = undefined;
            });
            for (const place of invalidPlaces) {
              if (place.type === 'newTransition') {
                continue;
              }
              const foundPlace = net.places.find((p) => p.id === place.place);
              if (foundPlace) {
                foundPlace.issueStatus = place.type;
              }
            }
            return { net, point };
          })
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
