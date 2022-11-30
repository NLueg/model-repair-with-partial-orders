import { TestBed } from '@angular/core/testing';

import { StatehandlerService } from './statehandler.service';

describe('StatehandlerService', () => {
  let service: StatehandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: StatehandlerService, useValue: {} }],
    });
    service = TestBed.inject(StatehandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
