import { Component, ElementRef, ViewChild } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

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

  constructor(
    private layoutService: LayoutService,
    private svgService: SvgService,
    private displayService: DisplayService,
    private petriNetRegionsService: PetriNetRegionsService
  ) {
    this.svgElements$ = this.displayService.getPetriNet$().pipe(
      map((currentRun) => this.layoutService.layout(currentRun).run),
      switchMap((petriNet) =>
        this.displayService.getPartialOrders$().pipe(
          // TODO: Fire more partial orders
          switchMap((partialOrders) => {
            if (partialOrders.length === 0) {
              return of([]);
            }

            const invalidPlaces = this.firePartialOrder(
              petriNet,
              partialOrders[partialOrders.length - 1]
            );

            // TODO: Generate repair suggestions for each place
            return this.petriNetRegionsService
              .computeRegions(partialOrders, petriNet, invalidPlaces)
              .pipe(map(() => invalidPlaces));
          }),
          map((invalidPlaces) => {
            petriNet.places.forEach((place) => {
              place.invalid = undefined;
            });
            for (const place of invalidPlaces) {
              const foundPlace = petriNet.places.find((p) => p.id === place);
              if (foundPlace) {
                foundPlace.invalid = true;
              }
            }
            return petriNet;
          })
        )
      ),
      map((modifiedRun) => {
        if (this.canvas && this.canvas.drawingArea) {
          const w = this.canvas.drawingArea.nativeElement.clientWidth;
          const h = this.canvas.drawingArea.nativeElement.clientHeight;
          if (w > 0 && h > 0)
            this.layoutService.centerPetriNet(modifiedRun, w / 2, h / 2);
        }
        return [...this.svgService.createSvgElements(modifiedRun)];
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
