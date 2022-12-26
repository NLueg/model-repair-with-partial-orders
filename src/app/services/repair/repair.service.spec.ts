import { OverlayModule } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { RepairService } from './repair.service';

describe('RepairService', () => {
  let service: RepairService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ToastrService,
          useValue: { toasts: [], warning: jest.fn() },
        },
      ],
      imports: [OverlayModule],
    });
    service = TestBed.inject(RepairService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
