import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayService } from '../../services/display.service';
import { SvgService } from '../../services/svg/svg.service';
import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CanvasComponent],
      providers: [
        { provide: SvgService, useValue: {} },
        { provide: DisplayService, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
