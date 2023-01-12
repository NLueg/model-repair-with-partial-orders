import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';

import {
  FirePartialOrder,
  FireResultPerPlace,
} from '../../algorithms/fire-partial-orders/fire-partial-order';
import { PetriNetRegionsService } from '../../algorithms/regions/petri-net-regions.service';
import { Arc } from '../../classes/diagram/arc';
import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { LayoutResult, LayoutService } from '../../services/layout.service';
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

  constructor(
    private layoutService: LayoutService,
    private svgService: SvgService,
    private displayService: DisplayService,
    private petriNetRegionsService: PetriNetRegionsService
  ) {
    this.invalidPlaceCount$ = new BehaviorSubject<{ count: number } | null>(
      null
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
              return of([]);
            }

            const invalidPlaces: {
              [key: string]: { count: number; blockedArcs: Arc[] };
            } = {};
            for (let index = 0; index < partialOrders.length; index++) {
              const currentInvalid = this.firePartialOrder(
                net,
                partialOrders[index]
              );

              currentInvalid.forEach((place) => {
                if (invalidPlaces[place.placeId] === undefined) {
                  invalidPlaces[place.placeId] = {
                    count: 0,
                    blockedArcs: [],
                  };
                }
                invalidPlaces[place.placeId].count++;
                invalidPlaces[place.placeId].blockedArcs.push(
                  ...place.invalidArcs
                );
              });
            }

            this.invalidPlaceCount$.next({
              count: Object.keys(invalidPlaces).length,
            });

            return this.petriNetRegionsService.computeRegions(
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
  ): FireResultPerPlace[] {
    return new FirePartialOrder(petriNet, partialOrder).getInvalidPlaces();
  }
}
