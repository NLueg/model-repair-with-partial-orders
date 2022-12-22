import { Injectable } from '@angular/core';
import clonedeep from 'lodash.clonedeep';
import { first, map } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../display.service';
import { UploadService } from '../upload/upload.service';
import { AutoSolution } from './repair.model';

@Injectable({
  providedIn: 'root',
})
export class NetCommandService {
  undoQueue: PetriNet[] = [];
  redoQueue: PetriNet[] = [];

  constructor(
    private uploadService: UploadService,
    private displayService: DisplayService
  ) {}

  repairNet(placeId: string, solutions: AutoSolution[]): void {
    this.displayService
      .getPetriNet$()
      .pipe(
        first(),
        map((petriNet) => {
          const placeIndex = petriNet.places.findIndex((p) => p.id === placeId);
          if (!placeIndex) {
            return;
          }

          // TODO: Apply solution!!
          const newNet = clonedeep(petriNet);
          this.undoQueue.push(newNet);
        })
      )
      .subscribe();
  }

  undo(): void {
    const net = this.undoQueue.pop();
    if (!net) {
      return;
    }

    this.redoQueue.push(net);
    this.displayService.setNewNet(net);
  }

  redo(): void {
    const net = this.redoQueue.pop();
    if (!net) {
      return;
    }

    this.undoQueue.push(net);
    this.displayService.setNewNet(net);
  }
}
