import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Unsubscribable } from 'rxjs';

import { RepairMenuComponent } from '../../components/repair-menu/repair-menu.component';
import { PlaceSolutions } from './repair.model';

@Injectable({
  providedIn: 'root',
})
export class RepairService {
  private solutions: PlaceSolutions[] = [];
  private overlayRef?: OverlayRef;
  private outsideClickSubscription?: Unsubscribable;

  constructor(private toastr: ToastrService, private overlay: Overlay) {}

  saveNewSolutions(solutions: PlaceSolutions[]): void {
    this.solutions = solutions;
  }

  showRepairPopover(ref: DOMRect, place: string): void {
    const solutionsForPlace = this.solutions.filter((s) => s.place === place);
    if (!solutionsForPlace) {
      this.toastr.warning(`No solutions found for place ${place}`);
      return;
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
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
    this.overlayRef.updateScrollStrategy(
      this.overlay.scrollStrategies.block() // TODO: Should be "reposition"
    );
    this.outsideClickSubscription = this.overlayRef
      .outsidePointerEvents()
      .subscribe(() => {
        this.overlayRef?.dispose();
      });

    const componentRef = this.overlayRef.attach(componentPortal);
    componentRef.instance.placeId = place;
    componentRef.instance.overlayRef = this.overlayRef;
    componentRef.instance.solutions = solutionsForPlace
      .filter((s) => s.solutions)
      .map((s) => s.solutions!);
  }
}
