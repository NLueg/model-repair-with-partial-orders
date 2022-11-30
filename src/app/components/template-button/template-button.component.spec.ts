import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateButtonComponent } from './template-button.component';

describe('TemplateButtonComponent', () => {
  let component: TemplateButtonComponent;
  let fixture: ComponentFixture<TemplateButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
