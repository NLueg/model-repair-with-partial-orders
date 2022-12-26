import { TestBed } from '@angular/core/testing';

import { RepairService } from '../repair/repair.service';
import { SvgService } from './svg.service';

describe('SvgService', () => {
  let service: SvgService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: RepairService,
          useValue: {},
        },
      ],
    });
    service = TestBed.inject(SvgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
