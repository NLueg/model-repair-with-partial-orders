import { TestBed } from '@angular/core/testing';

import { MoveElementsService } from './move-elements.service';

describe('MoveElementsService', () => {
  let service: MoveElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MoveElementsService, useValue: {} }],
    });
    service = TestBed.inject(MoveElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
