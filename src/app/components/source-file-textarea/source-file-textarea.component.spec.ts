import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petri-net';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { UploadService } from '../../services/upload/upload.service';
import { SourceFileTextareaComponent } from './source-file-textarea.component';

describe('SourceFileTextareaComponent', () => {
  let component: SourceFileTextareaComponent;
  let fixture: ComponentFixture<SourceFileTextareaComponent>;

  const mockUploadService = {
    getLogUpload$: () => of(undefined),
    getNetUpload$: () => of(undefined),
  };

  const petriNet: PetriNet = {
    places: [],
    transitions: [],
    arcs: [],
  };

  const mockDisplayService = {
    hasPreviousRun$: () => of(undefined),
    hasNextRun$: () => of(undefined),
    isCurrentRunEmpty$: () => of(undefined),
    getCurrentRunIndex$: () => of(undefined),
    getRunCount$: () => of(undefined),
    setPreviousRun: () => petriNet,
    setNewNet: jest.fn(),
    registerRun: jest.fn(),
    getPetriNet$: () => of(petriNet),
    getCurrentErrors$: () => new Set(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourceFileTextareaComponent],
      providers: [
        { provide: ParserService, useValue: { parsePetriNet: () => petriNet } },
        { provide: DisplayService, useValue: mockDisplayService },
        { provide: UploadService, useValue: mockUploadService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceFileTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
