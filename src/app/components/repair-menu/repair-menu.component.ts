import { OverlayRef } from '@angular/cdk/overlay';
import { Component, EventEmitter, OnInit } from '@angular/core';

import { SolutionType } from '../../algorithms/regions/ilp-solver/solver-classes';
import {
  AutoRepair,
  AutoRepairWithSolutionType,
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

  applySolution = new EventEmitter<void>();

  constructor(private netCommandService: NetCommandService) {}

  ngOnInit(): void {
    if (this.placeSolution.type === 'warning') {
      this.infoHeader = `The place has ${this.placeSolution.tooManyTokens} too many tokens`;
      this.shownTextsForSolutions = [
        {
          text: {
            label: `<b>Change marking to ${this.placeSolution.reduceTokensTo}</b>`,
            tooltip: `Change marking to ${this.placeSolution.reduceTokensTo}`,
          },
          solution: {
            type: 'marking',
            newMarking: this.placeSolution.reduceTokensTo,
          },
        },
      ];
      return;
    }

    const percentage = Intl.NumberFormat('default', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(this.placeSolution.invalidTraceCount / this.partialOrderCount);
    this.infoHeader = `The place cannot fire for ${this.placeSolution.invalidTraceCount} (${percentage}) traces.<br/>`;

    if (this.placeSolution.missingTokens) {
      this.infoHeader += `The place has ${this.placeSolution.missingTokens} missing tokens.<br/>`;
    }

    const solutions = this.placeSolution.solutions;
    if (!solutions) {
      console.error('No solution found!');
    } else {
      this.shownTextsForSolutions = solutions.map((solution) => ({
        text: generateTextForAutoRepair(solution),
        solution,
      }));
    }

    this.infoHeader += 'Choose a solution to repair the place:';
  }

  useSolution(solution: AutoRepair): void {
    this.applySolution.next();
    this.netCommandService
      .repairNet(this.placeSolution.place, solution)
      .subscribe(() => this.overlayRef?.dispose());
  }
}

function generateTextForAutoRepair(
  solution: AutoRepairWithSolutionType
): LabelWithTooltip {
  const baseText = generateBaseText(solution.repairType);

  if (solution.type === 'replace-place') {
    return {
      label: `${baseText}Replace place with ${solution.places.length}`,
      tooltip: solution.places
        .map(
          (place, index) => `
        ${index + 1}. Place:
        ${tooltipForSinglePlaceParameter(place)}`
        )
        .join(''),
    };
  }
  if (solution.type === 'marking') {
    return {
      label: `${baseText}Change marking to ${solution.newMarking}`,
      tooltip: `Change marking to ${solution.newMarking}`,
    };
  }

  return handleModifyPlace(solution);
}

function handleModifyPlace(
  solution: { type: 'modify-place' } & SinglePlaceParameter & {
      repairType: SolutionType;
    }
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
    label: `${generateBaseText(
      solution.repairType
    )}Update place to have ${incomingText}${andText}${outgoingText} arcs${markingText}`,
    tooltip: tooltipForSinglePlaceParameter(solution),
  };
}

const solutionTypeToText: { [key in SolutionType]: string } = {
  arcsSame: 'Same arcs',
  sameIncoming: 'Same incoming weights',
  sameOutgoing: 'Same outgoing weights',
  unbounded: 'New place',
};

function generateBaseText(type: SolutionType): string {
  const text = solutionTypeToText[type];
  return `<b>${text}</b>:<br/>`;
}

function tooltipForSinglePlaceParameter(
  solution: SinglePlaceParameter
): string {
  const incomingString =
    solution.incoming.length > 0
      ? `• incoming: ${solution.incoming
          .map((arc) =>
            arc.weight > 1
              ? `${arc.transitionId} (${arc.weight})`
              : arc.transitionId
          )
          .join(', ')} \n`
      : '';
  const outgoingString =
    solution.outgoing.length > 0
      ? `• outgoing: ${solution.outgoing
          .map((arc) =>
            arc.weight > 1
              ? `${arc.transitionId} (${arc.weight})`
              : arc.transitionId
          )
          .join(', ')} \n`
      : '';

  return `
  ${incomingString}${outgoingString}• marking: ${
    solution.newMarking ? solution.newMarking : '0'
  }
  `.trim();
}
