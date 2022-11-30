import { TestBed } from '@angular/core/testing';

import { DraggingCreationService } from './draggable-creation.service';

describe('DraggingCreationService', () => {
  let service: DraggingCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: DraggingCreationService, useValue: {} }],
    });
    service = TestBed.inject(DraggingCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
