import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PetriNet } from '../../classes/diagram/petriNet';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { UploadService } from '../../services/upload/upload.service';
import { SourceFileTextareaComponent } from './source-file-textarea.component';

describe('SourceFileTextareaComponent', () => {
  let component: SourceFileTextareaComponent;
  let fixture: ComponentFixture<SourceFileTextareaComponent>;

  const mockUploadService = {
    getUpload$: () => of(undefined),
  };

  const run: PetriNet = {
    text: '',
    elements: [],
    warnings: [],
    arcs: [],
  };

  const mockDisplayService = {
    hasPreviousRun$: () => of(undefined),
    hasNextRun$: () => of(undefined),
    isCurrentRunEmpty$: () => of(undefined),
    getCurrentRunIndex$: () => of(undefined),
    getRunCount$: () => of(undefined),
    coordsInfoAdded: () => of(undefined),
    offsetInfoAdded: () => of(undefined),
    setPreviousRun: () => run,
    registerRun: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SourceFileTextareaComponent],
      providers: [
        { provide: ParserService, useValue: { parse: () => run } },
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
