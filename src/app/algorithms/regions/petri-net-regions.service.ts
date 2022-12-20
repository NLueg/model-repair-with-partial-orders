import { Injectable } from '@angular/core';
import { GLPK } from 'glpk.js';
import { from, Observable, switchMap } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petri-net';
import { parsedSimpleExampleLogInvalid } from '../../services/upload/simple-example/simple-example-parsed';
import { IlpSolver } from './ilp-solver/ilp-solver';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createGlpk: () => Promise<GLPK> = require('glpk.js').default;

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionsService {
  // TODO: Partial order should be a parameter!
  computeRegions(
    petriNet: PetriNet,
    invalidPlaces: string[]
  ): Observable<void> {
    return from(createGlpk()).pipe(
      switchMap((glpk: GLPK) =>
        new IlpSolver(glpk).computeRegions(
          [parsedSimpleExampleLogInvalid],
          petriNet,
          invalidPlaces[0]
        )
      )
    );
  }
}
