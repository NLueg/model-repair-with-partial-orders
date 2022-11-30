import { TestBed } from '@angular/core/testing';

import { FindElementsService } from './find-elements.service';

describe('FindElementsService', () => {
  let service: FindElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FindElementsService, useValue: {} }],
    });
    service = TestBed.inject(FindElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
