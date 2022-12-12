import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  concatMap,
  EMPTY,
  filter,
  from,
  map,
  Observable,
} from 'rxjs';

import { PartialOrderNetWithContainedTraces } from '../../../models/pn/model/partial-order-net-with-contained-traces';
import { PetriNet } from '../../../models/pn/model/petri-net';
import { PetriNetIsomorphismService } from '../isomorphism/petri-net-isomorphism.service';
import { ImplicitPlaceRemoverService } from './place-remover/implicit-place-remover.service';
import { PrimeMinerResult } from './prime-miner-result';
import { PetriNetRegionSynthesisService } from './regions/petri-net-region-synthesis.service';
import { RegionsConfiguration } from './regions/regions-configuration';

@Injectable({
  providedIn: 'root',
})
export class PrimeMinerService {
  constructor(
    protected _synthesisService: PetriNetRegionSynthesisService,
    protected _isomorphismService: PetriNetIsomorphismService,
    protected _implicitPlaceRemover: ImplicitPlaceRemoverService
  ) {}

  /**
   * Generates a petri net from a partial order
   * @param minerInputs partial order net with the contained traces
   * @param config
   */
  public mine(
    minerInputs: Array<PartialOrderNetWithContainedTraces>,
    config: RegionsConfiguration = {}
  ): Observable<PrimeMinerResult> {
    if (minerInputs.length === 0) {
      console.error('Miner input must be non empty');
      return EMPTY;
    }

    // Sortiert nach höchster Frequenz (häufigste Logs zuerst)
    minerInputs.sort(
      (a, b) => (b.net?.frequency ?? 0) - (a.net?.frequency ?? 0)
    );

    let bestResult = new PrimeMinerResult(new PetriNet(), [], []);
    let nextInputIndex = 1;

    const minerInput$ = new BehaviorSubject(minerInputs[0]);
    return minerInput$.pipe(
      concatMap((nextInput) => {
        // Synthesise the given inputs to a single net
        // The first net is just empty, and we try to add the next input to it
        return this._synthesisService
          .synthesise([bestResult.net, nextInput.net], config)
          .pipe(
            map((result) => ({
              result,
              containedTraces: [
                ...bestResult.containedTraces,
                ...nextInput.containedTraces,
              ],
            }))
          );
      }),
      map((result) => {
        console.debug(`Iteration ${nextInputIndex} completed`, result);

        const synthesisedNet = result.result.result;
        const r: Array<PrimeMinerResult> = [];
        if (this.isConnected(synthesisedNet)) {
          const noImplicit =
            this._implicitPlaceRemover.removeImplicitPlaces(synthesisedNet);

          if (
            !this._isomorphismService.arePetriNetsIsomorphic(
              bestResult.net,
              noImplicit
            ) &&
            !bestResult.net.isEmpty()
          ) {
            r.push(bestResult);
          }

          bestResult = new PrimeMinerResult(
            noImplicit,
            [...bestResult.supportedPoIndices, nextInputIndex],
            result.containedTraces
          );

          if (nextInputIndex === minerInputs.length) {
            r.push(bestResult);
          }
        }

        if (nextInputIndex < minerInputs.length) {
          minerInput$.next(minerInputs[nextInputIndex]);
          nextInputIndex++;
        } else {
          minerInput$.complete();
        }

        console.debug('best running result', bestResult);
        return r;
      }),
      filter((a) => a.length > 0),
      concatMap((a) => from(a))
    );
  }

  private isConnected(net: PetriNet): boolean {
    return net.getTransitions().every((t) => t.ingoingArcs.length > 0);
  }
}
