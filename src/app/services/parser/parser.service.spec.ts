import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import {
  exampleLog,
  exampleLogInvalid,
  examplePetriNet,
} from '../upload/example-file';
import {
  parsedInvalidPartialorder,
  parsedPartialOrder,
  parsedPetriNet,
} from '../upload/example-file-parsed';
import { ParserService } from './parser.service';

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ToastrService,
          useValue: { toasts: [], warning: jest.fn() },
        },
      ],
    });
    service = TestBed.inject(ParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('parseNet should parse example petri net', () => {
    const errors = new Set<string>();
    const result = service.parsePetriNet(examplePetriNet, errors);

    expect(result).toEqual(parsedPetriNet);
  });

  it('parseLog should parse example log', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrder(exampleLog, errors);

    expect(result).toEqual(parsedPartialOrder);
  });

  it('parseLog should parse invalid example log', () => {
    const errors = new Set<string>();
    const result = service.parsePartialOrder(exampleLogInvalid, errors);

    expect(result).toEqual(parsedInvalidPartialorder);
  });
});
