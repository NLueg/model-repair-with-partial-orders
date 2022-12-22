import { TestBed } from '@angular/core/testing';

import { NetCommandService } from './net-command.service';

describe('NetCommandService', () => {
  let service: NetCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
