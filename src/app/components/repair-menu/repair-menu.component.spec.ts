import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetCommandService } from '../../services/repair/net-command.service';
import { RepairMenuComponent } from './repair-menu.component';

describe('RepairMenuComponent', () => {
  let component: RepairMenuComponent;
  let fixture: ComponentFixture<RepairMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepairMenuComponent],
      providers: [{ provide: NetCommandService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(RepairMenuComponent);

    component = fixture.componentInstance;
    component.placeSolution = {
      type: 'error',
      place: 'p1',
      solutions: [
        {
          type: 'marking',
          repairType: 'multiplePlaces',
          newMarking: 1,
        },
      ],
      missingTokens: undefined,
      invalidTraceCount: 0,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
