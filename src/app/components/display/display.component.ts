import { Point } from '@angular/cdk/drag-drop';
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

import { FirePartialOrder } from '../../algorithms/fire-partial-orders/fire-partial-order';
import { PetriNetRegionsService } from '../../algorithms/regions/petri-net-regions.service';
import { PartialOrder } from '../../classes/diagram/partial-order';
import { PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent {
  svgElements$: Observable<SVGElement[]>;
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
      map((partialOrders) => partialOrders.length),
      shareReplay(1)
    );

    this.svgElements$ = this.displayService.getPetriNet$().pipe(
      map((currentRun) => this.layoutService.layout(currentRun)),
      switchMap(({ net, point }) =>
        this.displayService.getPartialOrders$().pipe(
          switchMap((partialOrders) => {
            if (partialOrders.length === 0) {
              return of([]);
            }

            const invalidPlaces: { [key: string]: number } = {};
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
      ),
      map(({ net, point }) => {
        let offset: Point;

        if (this.canvas && this.canvas.drawingArea) {
          const canvasWidth = this.canvas.drawingArea.nativeElement.clientWidth;
          const canvasHeight =
            this.canvas.drawingArea.nativeElement.clientHeight;

          offset = {
            x: Math.floor((canvasWidth - point.x) / 2),
            y: Math.floor((canvasHeight - point.y) / 2),
          };
        } else {
          offset = { x: 0, y: 0 };
        }
        return [...this.svgService.createNetElements(net, offset)];
      })
    );
  }

  private firePartialOrder(
    petriNet: PetriNet,
    partialOrder: PartialOrder
  ): string[] {
    return new FirePartialOrder(petriNet, partialOrder).getInvalidPlaces();
  }
}
