import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Unsubscribable } from 'rxjs';

import { RepairMenuComponent } from '../../components/repair-menu/repair-menu.component';
import { PlaceSolution } from './repair.model';

@Injectable({
  providedIn: 'root',
})
export class RepairService {
  private currentPlace?: string;

  private solutions: PlaceSolution[] = [];
  private partialOrderCount = 0;
  private overlayRef?: OverlayRef;
  private outsideClickSubscription?: Unsubscribable;

  private unsubscribables: Unsubscribable[] = [];

  constructor(private toastr: ToastrService, private overlay: Overlay) {}

  saveNewSolutions(
    solutions: PlaceSolution[],
    partialOrderCount: number
  ): void {
    this.solutions = solutions;
    this.partialOrderCount = partialOrderCount;
  }

  showRepairPopover(ref: DOMRect, place: string): void {
    if (this.currentPlace === place) {
      this.currentPlace = undefined;
      this.overlayRef?.dispose();
      return;
    }

    const solutionsForPlace = this.solutions.find((s) => s.place === place);
    if (!solutionsForPlace) {
      this.toastr.warning(`No solutions found for place ${place}`);
      return;
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    this.currentPlace = place;
    if (this.outsideClickSubscription) {
      this.outsideClickSubscription.unsubscribe();
    }

    this.overlayRef = this.overlay.create();
    const position = this.overlay
      .position()
      .flexibleConnectedTo(ref)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
      ]);

    // We create the overlay
    //Then we create a portal to render a component
    const componentPortal = new ComponentPortal(RepairMenuComponent);

    this.overlayRef.addPanelClass('current-overlay');
    this.overlayRef.updatePositionStrategy(position);
    this.overlayRef.updateScrollStrategy(this.overlay.scrollStrategies.noop());

    this.unsubscribables.push(
      (this.outsideClickSubscription = this.overlayRef
        .outsidePointerEvents()
        .subscribe(() => this.clearOverlay()))
    );

    const componentRef = this.overlayRef.attach(componentPortal);
    componentRef.instance.overlayRef = this.overlayRef;
    componentRef.instance.placeSolution = solutionsForPlace;
    componentRef.instance.partialOrderCount = this.partialOrderCount;

    this.unsubscribables.push(
      componentRef.instance.applySolution.subscribe(() => this.clearOverlay())
    );
  }

  private clearOverlay(): void {
    this.currentPlace = undefined;
    this.overlayRef?.dispose();
    this.overlayRef = undefined;

    this.unsubscribables.forEach((u) => u.unsubscribe());
    this.unsubscribables = [];
  }
}
