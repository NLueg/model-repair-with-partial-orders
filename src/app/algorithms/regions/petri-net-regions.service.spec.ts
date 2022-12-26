import { TestBed } from '@angular/core/testing';

import { RepairService } from '../../services/repair/repair.service';
import { PetriNetRegionsService } from './petri-net-regions.service';

describe('PetriNetRegionsService', () => {
  let service: PetriNetRegionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RepairService, useValue: {} }],
    });
    service = TestBed.inject(PetriNetRegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
