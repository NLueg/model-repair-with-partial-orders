import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DownloadService } from '../../../services/download/download.service';
import { DownloadPopoverComponent } from './download-popover.component';

describe('DownloadPopoverComponent', () => {
  let component: DownloadPopoverComponent;
  let fixture: ComponentFixture<DownloadPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DownloadPopoverComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: DownloadService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
