import { Injectable } from '@angular/core';
import { GLPK } from 'glpk.js';
import { from, Observable, switchMap } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petri-net';
import { IlpSolver } from './ilp-solver/ilp-solver';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createGlpk: () => Promise<GLPK> = require('glpk.js').default;

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionsService {
  computeRegions(nets: PetriNet): Observable<void> {
    return from(createGlpk()).pipe(
      switchMap((glpk: GLPK) => new IlpSolver(glpk).computeRegions(nets, {}))
    );
  }
}
