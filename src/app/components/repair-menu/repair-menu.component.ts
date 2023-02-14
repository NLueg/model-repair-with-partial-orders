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
    })
      .format(this.placeSolution.invalidTraceCount / this.partialOrderCount)
      .replace(' ', '');
    if (this.placeSolution.type === 'newTransition') {
      this.infoHeader = `The transition ${this.placeSolution.missingTransition} is missing for ${this.placeSolution.invalidTraceCount} (${percentage}) traces.`;
      this.shownTextsForSolutions = this.generateSolutionToDisplay(
        this.placeSolution.solutions
      );
      return;
    }

    this.infoHeader = `The place cannot fire for ${this.placeSolution.invalidTraceCount} (${percentage}) traces.<br/>`;

    if (this.placeSolution.missingTokens) {
      this.infoHeader += `The place has ${
        this.placeSolution.missingTokens
      } missing ${
        this.placeSolution.missingTokens === 1 ? 'token' : 'tokens'
      }.<br/>`;
    }

    const solutions = this.placeSolution.solutions;
    if (!solutions) {
      console.error('No solution found!');
    } else {
      this.shownTextsForSolutions = this.generateSolutionToDisplay(solutions);
    }

    this.infoHeader += 'Choose a solution to repair the place:';
  }

  useSolution(solution: AutoRepair): void {
    this.applySolution.next();

    if (this.placeSolution.type === 'newTransition') {
      this.netCommandService
        .repairNetForNewTransition(
          this.placeSolution.missingTransition,
          solution
        )
        .subscribe(() => this.overlayRef?.dispose());
    } else {
      this.netCommandService
        .repairNet(this.placeSolution.place, solution)
        .subscribe(() => this.overlayRef?.dispose());
    }
  }

  private generateSolutionToDisplay(
    solutions: AutoRepairWithSolutionType[]
  ): { text: LabelWithTooltip; solution: AutoRepair }[] {
    return solutions.map((solution) => ({
      text: generateTextForAutoRepair(solution),
      solution,
    }));
  }
}

function generateTextForAutoRepair(
  solution: AutoRepairWithSolutionType
): LabelWithTooltip {
  const baseText = generateBaseText(solution);

  if (solution.type === 'replace-place') {
    return {
      label: baseText,
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
      label: baseText,
      tooltip: `Change marking to ${solution.newMarking}`,
    };
  }

  return {
    label: baseText,
    tooltip: tooltipForSinglePlaceParameter(solution),
  };
}

const solutionTypeToText: { [key in SolutionType]: string } = {
  changeMarking: 'Add marking',
  changeIncoming: 'Change ingoing arcs',
  multiplePlaces: 'Add minimal region',
};

function generateBaseText(solution: AutoRepairWithSolutionType): string {
  let text = solutionTypeToText[solution.repairType];
  if (solution.type === 'replace-place' && solution.places.length > 1) {
    text = `Add minimal regions`;
  }
  return text;
}

function tooltipForSinglePlaceParameter(
  solution: SinglePlaceParameter
): string {
  const incomingString =
    solution.incoming.length > 0
      ? `• incoming: ${solution.incoming
          .map((arc) =>
            arc.weight > 1
              ? `${arc.transitionLabel} (${arc.weight})`
              : arc.transitionLabel
          )
          .join(', ')} \n`
      : '';
  const outgoingString =
    solution.outgoing.length > 0
      ? `• outgoing: ${solution.outgoing
          .map((arc) =>
            arc.weight > 1
              ? `${arc.transitionLabel} (${arc.weight})`
              : arc.transitionLabel
          )
          .join(', ')} \n`
      : '';

  return `
  ${incomingString}${outgoingString}• marking: ${
    solution.newMarking ? solution.newMarking : '0'
  }
  `.trim();
}
