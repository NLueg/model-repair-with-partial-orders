import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { PetriNet } from '../../../../models/pn/model/petri-net';
import { PetriNetRegionsService } from './petri-net-region/petri-net-regions.service';
import { PetriNetSerialisationService } from './petri-net-serialisation/petri-net-serialisation.service';
import { RegionSynthesiser } from './region-synthesiser';
import { RegionsConfiguration } from './regions-configuration';

export class SynthesisResult {
  constructor(
    public input: Array<PetriNet>,
    public result: PetriNet,
    public fileName: string
  ) {}
}

@Injectable({
  providedIn: 'root',
})
export class PetriNetRegionSynthesisService {
  constructor(
    private _regionService: PetriNetRegionsService,
    private _serializer: PetriNetSerialisationService
  ) {}

  public synthesise(
    input: PetriNet | Array<PetriNet>,
    config: RegionsConfiguration = {},
    fileName = 'result'
  ): Observable<SynthesisResult> {
    const result$ = new ReplaySubject<SynthesisResult>(1);
    const synthesiser = new RegionSynthesiser();

    const arrayInput = Array.isArray(input) ? input : [input];

    // Generates regions for the nets
    this._regionService.computeRegions(arrayInput, config).subscribe({
      next: (region) => {
        synthesiser.addRegion(region);
        console.debug(this._serializer.serialise(region.net));
      },
      complete: () => {
        result$.next(
          new SynthesisResult(arrayInput, synthesiser.synthesise(), fileName)
        );
        result$.complete();
      },
    });

    return result$.asObservable();
  }
}
