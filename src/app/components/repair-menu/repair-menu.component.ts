import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';

import { AutoRepair } from '../../algorithms/regions/parse-solutions.fn';
import { NetCommandService } from '../../services/repair/net-command.service';
import { PlaceSolution } from '../../services/repair/repair.model';

@Component({
  selector: 'app-repair-menu',
  templateUrl: './repair-menu.component.html',
  styleUrls: ['./repair-menu.component.scss'],
})
export class RepairMenuComponent implements OnInit {
  placeSolution!: PlaceSolution;
  partialOrderCount!: number;
  shownTextsForSolutions: { text: string; solution: AutoRepair }[] = [];
  overlayRef?: OverlayRef;

  infoHeader = '';

  constructor(private netCommandService: NetCommandService) {}

  ngOnInit(): void {
    const solution = this.placeSolution.solutions;
    if (!solution) {
      throw Error('No solution found!');
    }

    this.shownTextsForSolutions = [
      {
        text: generateTextForAutoRepair(solution),
        solution,
      },
    ];

    const percentage = Intl.NumberFormat('default', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(this.placeSolution.invalidTraceCount / this.partialOrderCount);
    this.infoHeader = `The place cannot fire for ${this.placeSolution.invalidTraceCount} (${percentage}) traces. Choose a solution to repair the place:`;
  }

  useSolution(solution: AutoRepair): void {
    this.netCommandService
      .repairNet(this.placeSolution.place, solution)
      .subscribe(() => this.overlayRef?.dispose());
  }
}

// TODO: Better texts!
function generateTextForAutoRepair(solution: AutoRepair): string {
  if (solution.type === 'replace-place') {
    return `Replace with ${solution.places.length} new places`;
  }
  if (solution.type === 'marking') {
    return `Increase marking to ${solution.newMarking}`;
  }
  return `Update existing place to have ${solution.incoming.length} incoming and ${solution.outgoing.length} outgoing arcs`;
}
