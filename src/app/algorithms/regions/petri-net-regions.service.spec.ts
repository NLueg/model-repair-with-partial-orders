import { TestBed } from '@angular/core/testing';

import { PetriNetRegionsService } from './petri-net-regions.service';

describe('PetriNetRegionsService', () => {
  let service: PetriNetRegionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PetriNetRegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
