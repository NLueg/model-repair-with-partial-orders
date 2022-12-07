import { TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';

import { exampleLog, examplePetriNet } from '../upload/example-file';
import { ParserService } from './parser.service';
import {parsedPartialOrder, parsedPetriNet} from "../upload/example-file-parsed";

describe('ParserService', () => {
  let service: ParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ToastrService, useValue: { toasts: [] } }],
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
    const result = service.parseLog(exampleLog, errors);

    expect(result).toEqual(parsedPartialOrder);
});

