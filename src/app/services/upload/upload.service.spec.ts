import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: {} }],
    });
    service = TestBed.inject(UploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
