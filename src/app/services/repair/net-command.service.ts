import { Injectable } from '@angular/core';
import { first, map, Observable, tap } from 'rxjs';

import { AutoRepair } from '../../algorithms/regions/parse-solutions.fn';
import { PetriNet } from '../../classes/diagram/petri-net';
import { Place } from '../../classes/diagram/place';
import { DisplayService } from '../display.service';
import { generateTextFromNet } from '../parser/net-to-text.func';
import {
  arcsAttribute,
  netTypeKey,
  placesAttribute,
  transitionsAttribute,
} from '../parser/parsing-constants';
import { UploadService } from '../upload/upload.service';

@Injectable({
  providedIn: 'root',
})
export class NetCommandService {
  undoQueue: string[] = [];
  redoQueue: string[] = [];

  constructor(
    private uploadService: UploadService,
    private displayService: DisplayService
  ) {}

  repairNet(placeId: string, solution: AutoRepair): Observable<string | null> {
    return this.displayService.getPetriNet$().pipe(
      first(),
      map((petriNet) => {
        const placeIndex = petriNet.places.findIndex((p) => p.id === placeId);
        if (placeIndex === -1) {
          return null;
        }

        this.undoQueue.push(generateTextFromNet(petriNet));
        return generateTextForNewNet(placeIndex, petriNet, solution);
      }),
      tap((newNet) => {
        if (newNet) {
          this.uploadService.setUploadText(newNet);
        }
      })
    );
  }

  undo(): void {
    const net = this.undoQueue.pop();
    if (!net) {
      return;
    }

    this.uploadService
      .getUpload$()
      .pipe(first())
      .subscribe((currentUpload) => {
        this.redoQueue.push(currentUpload);
        this.uploadService.setUploadText(net);
      });
  }

  redo(): void {
    const net = this.redoQueue.pop();
    if (!net) {
      return;
    }

    this.uploadService
      .getUpload$()
      .pipe(first())
      .subscribe((currentUpload) => {
        this.undoQueue.push(currentUpload);
        this.uploadService.setUploadText(net);
      });
  }
}

function generateTextForNewNet(
  placeIndex: number,
  petriNet: PetriNet,
  solution: AutoRepair
): string {
  let newText = `${netTypeKey}\n${transitionsAttribute}\n`;
  petriNet.transitions.forEach((transition) => {
    newText += `${transition.id} ${transition.label}\n`;
  });

  newText += `${placesAttribute}\n`;
  petriNet.places.forEach((place, index) => {
    if (index !== placeIndex) {
      newText += `${place.id} ${place.marking}\n`;
    } else {
      newText += `${generatePlaceForSolution(place, solution)}\n`;
    }
  });

  const oldPlace: Place = petriNet.places[placeIndex];
  const arcsToGenerate = generateArcsForSolution(oldPlace, petriNet, solution);

  newText += `${arcsAttribute}\n`;
  arcsToGenerate.forEach((arc, index) => {
    newText += `${arc.source} ${arc.target}${
      arc.weight > 1 ? ` ${arc.weight}` : ''
    }`;

    if (index !== arcsToGenerate.length - 1) {
      newText += '\n';
    }
  });

  return newText;
}

function generatePlaceForSolution(
  oldPlace: Place,
  solution: AutoRepair
): string {
  if (solution.type === 'marking') {
    return `${oldPlace.id} ${solution.newMarking}`;
  }
  if (solution.type === 'modify-place' && solution.newMarking) {
    return `${oldPlace.id} ${solution.newMarking}`;
  }
  if (solution.type === 'replace-place') {
    let textToReturn = '';
    for (let index = 0; index < solution.places.length; index++) {
      textToReturn += `${oldPlace.id}_${index} 0`;
      if (index < solution.places.length - 1) {
        textToReturn += '\n';
      }
    }
    return textToReturn;
  }

  return `${oldPlace.id} ${oldPlace.marking}`;
}

function generateArcsForSolution(
  oldPlace: Place,
  petriNet: PetriNet,
  solution: AutoRepair
): SimpleArcDefinition[] {
  if (solution.type === 'marking') {
    return petriNet.arcs;
  }

  const filteredArcs: SimpleArcDefinition[] = petriNet.arcs.filter(
    (arc) => arc.target !== oldPlace.id && arc.source !== oldPlace.id
  );
  if (solution.type === 'modify-place') {
    return filteredArcs.concat(
      ...solution.incoming.map((incoming) => ({
        source: incoming.transitionId,
        target: oldPlace.id,
        weight: incoming.weight,
      })),
      ...solution.outgoing.map((outgoing) => ({
        source: oldPlace.id,
        target: outgoing.transitionId,
        weight: outgoing.weight,
      }))
    );
  }

  return filteredArcs.concat(
    solution.places.flatMap((place, index) => [
      ...place.incoming.map((incoming) => ({
        source: incoming.transitionId,
        target: `${oldPlace.id}_${index}`,
        weight: incoming.weight,
      })),
      ...place.outgoing.map((outgoing) => ({
        source: `${oldPlace.id}_${index}`,
        target: outgoing.transitionId,
        weight: outgoing.weight,
      })),
    ])
  );
}

type SimpleArcDefinition = { source: string; target: string; weight: number };
