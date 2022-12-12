import { Injectable, OnDestroy } from '@angular/core';
import { GLPK } from 'glpk.js';
import { Observable, ReplaySubject } from 'rxjs';

import { PetriNet } from '../../../../../models/pn/model/petri-net';
import { Region } from '../region';
import { RegionsConfiguration } from '../regions-configuration';
import { PetriNetRegionTransformerService } from './petri-net-region-transformer.service';
import { RegionIlpSolver } from './region-ilp-solver';

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionsService implements OnDestroy {
  private readonly _solver$: ReplaySubject<GLPK>;

  constructor(private _regionTransformer: PetriNetRegionTransformerService) {
    this._solver$ = new ReplaySubject<GLPK>(1);

    // get the solver object
    const promise = import('glpk.js');
    promise.then((result) => {
      // @ts-ignore
      result.default().then((glpk) => {
        this._solver$.next(glpk);
      });
    });
  }

  ngOnDestroy(): void {
    this._solver$.complete();
  }

  public computeRegions(
    nets: Array<PetriNet>,
    config: RegionsConfiguration
  ): Observable<Region> {
    return new RegionIlpSolver(
      this._regionTransformer,
      this._solver$.asObservable()
    ).computeRegions(nets, config);
  }
}
