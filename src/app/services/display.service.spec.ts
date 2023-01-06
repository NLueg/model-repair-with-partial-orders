import { TestBed } from '@angular/core/testing';

import { DisplayService } from './display.service';
import { ParserService } from './parser/parser.service';

describe('DisplayService', () => {
  let service: DisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ParserService,
          useValue: {
            parsePartialOrder: jest.fn().mockReturnValue(null),
          },
        },
      ],
    });
    service = TestBed.inject(DisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
