import { TestBed } from '@angular/core/testing';

import { DisplayService } from '../display.service';
import { DownloadService } from './download.service';
import { PetriNetToPnmlService } from './run-to-pnml/petri-net-to-pnml.service';

describe('DownloadService', () => {
  let service: DownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DisplayService, useValue: {} },
        { provide: PetriNetToPnmlService, useValue: {} },
      ],
    });
    service = TestBed.inject(DownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
