import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';

import {
  AutoRepair,
  SinglePlaceParameter,
} from '../../algorithms/regions/parse-solutions.fn';
import { NetCommandService } from '../../services/repair/net-command.service';
import { PlaceSolution } from '../../services/repair/repair.model';

type LabelWithTooltip = {
  label: string;
  tooltip: string;
};

@Component({
  selector: 'app-repair-menu',
  templateUrl: './repair-menu.component.html',
  styleUrls: ['./repair-menu.component.scss'],
})
export class RepairMenuComponent implements OnInit {
  placeSolution!: PlaceSolution;
  partialOrderCount!: number;
  shownTextsForSolutions: { text: LabelWithTooltip; solution: AutoRepair }[] =
    [];
  overlayRef?: OverlayRef;

  infoHeader = '';

  constructor(private netCommandService: NetCommandService) {}

  ngOnInit(): void {
    const percentage = Intl.NumberFormat('default', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(this.placeSolution.invalidTraceCount / this.partialOrderCount);
    this.infoHeader = `The place cannot fire for ${this.placeSolution.invalidTraceCount} (${percentage}) traces. Choose a solution to repair the place:`;

    const solution = this.placeSolution.solutions;
    if (!solution) {
      console.error('No solution found!');
    } else {
      this.shownTextsForSolutions = [
        {
          text: generateTextForAutoRepair(solution),
          solution,
        },
      ];
    }
  }

  useSolution(solution: AutoRepair): void {
    this.netCommandService
      .repairNet(this.placeSolution.place, solution)
      .subscribe(() => this.overlayRef?.dispose());
  }
}

function generateTextForAutoRepair(solution: AutoRepair): LabelWithTooltip {
  if (solution.type === 'replace-place') {
    return {
      label: `Replace place with ${solution.places.length}`,
      tooltip: solution.places
        .map(
          (place, index) => `
        ${index + 1}. ${tooltipForSinglePlaceParameter(place)}`
        )
        .join(''),
    };
  }
  if (solution.type === 'marking') {
    return {
      label: `Change marking to ${solution.newMarking}`,
      tooltip: `Change marking to ${solution.newMarking}`,
    };
  }

  return handleModifyPlace(solution);
}

function handleModifyPlace(
  solution: { type: 'modify-place' } & SinglePlaceParameter
): LabelWithTooltip {
  const incomingText =
    solution.incoming.length > 0 ? `${solution.incoming.length} incoming` : '';
  const outgoingText =
    solution.outgoing.length > 0 ? `${solution.outgoing.length} outgoing` : '';
  const andText = incomingText && outgoingText ? ' and ' : '';
  const markingText = solution.newMarking
    ? ` with marking ${solution.newMarking}`
    : '';

  return {
    label: `Update place to have ${incomingText}${andText}${outgoingText} arcs${markingText}`,
    tooltip: tooltipForSinglePlaceParameter(solution),
  };
}

function tooltipForSinglePlaceParameter(
  solution: SinglePlaceParameter
): string {
  return `
  • incoming: ${solution.incoming
    .map((arc) =>
      arc.weight > 1 ? `${arc.transitionId} (${arc.weight})` : arc.transitionId
    )
    .join(', ')}
  • outgoing: ${solution.outgoing
    .map((arc) =>
      arc.weight > 1 ? `${arc.transitionId} (${arc.weight})` : arc.transitionId
    )
    .join(', ')}
  • marking: ${solution.newMarking ? solution.newMarking : '0'}
  `;
}
