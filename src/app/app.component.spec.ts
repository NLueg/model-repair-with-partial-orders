import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { DisplayService } from './services/display.service';
import { NetCommandService } from './services/repair/net-command.service';
import { UploadService } from './services/upload/upload.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: DisplayService,
          useValue: {
            getPartialOrders$: jest.fn().mockReturnValue(of([])),
            isCurrentRunEmpty$: jest.fn().mockReturnValue(of(false)),
          },
        },
        { provide: UploadService, useValue: {} },
        { provide: NetCommandService, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
