import { Component, OnInit } from '@angular/core';

import { NetCommandService } from '../../services/repair/net-command.service';
import { AutoSolution } from '../../services/repair/repair.model';

@Component({
  selector: 'app-repair-menu',
  templateUrl: './repair-menu.component.html',
  styleUrls: ['./repair-menu.component.scss'],
})
export class RepairMenuComponent implements OnInit {
  placeId = '';
  solutions: AutoSolution[] = [];
  shownTextsForSolutions: { text: string; solution: AutoSolution[] }[] = [];

  constructor(private netCommandService: NetCommandService) {}

  // TODO: Support multiple solutions
  ngOnInit(): void {
    // TODO: Solution to Text!
    this.shownTextsForSolutions = [
      { text: 'Increase Marking of Place A by 1', solution: this.solutions },
    ];
  }

  useSolution(solution: AutoSolution[]): void {
    this.netCommandService.repairNet(this.placeId, this.solutions);
  }
}
