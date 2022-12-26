import { Component, OnInit } from '@angular/core';

import { AutoRepair } from '../../algorithms/regions/parse-solutions.fn';
import { NetCommandService } from '../../services/repair/net-command.service';

@Component({
  selector: 'app-repair-menu',
  templateUrl: './repair-menu.component.html',
  styleUrls: ['./repair-menu.component.scss'],
})
export class RepairMenuComponent implements OnInit {
  placeId = '';
  solutions: AutoRepair[] = [];
  shownTextsForSolutions: { text: string; solution: AutoRepair }[] = [];

  constructor(private netCommandService: NetCommandService) {}

  ngOnInit(): void {
    this.shownTextsForSolutions = this.solutions.map((solution) => {
      const text = generateTextForAutoRepair(solution);
      return { text, solution };
    });
  }

  useSolution(solution: AutoRepair): void {
    this.netCommandService.repairNet(this.placeId, solution).subscribe();
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
  return 'Update existing place';
}
