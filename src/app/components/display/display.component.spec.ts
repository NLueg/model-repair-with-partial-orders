import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PetriNetRegionsService } from '../../algorithms/regions/petri-net-regions.service';
import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { parsedPetriNet } from '../../services/upload/example-file-parsed';
import { DisplayComponent } from './display.component';

describe('DisplayComponent', () => {
  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
  let component: DisplayComponent;
  let fixture: ComponentFixture<DisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayComponent],
      providers: [
        { provide: LayoutService, useValue: {} },
        { provide: SvgService, useValue: {} },
        {
          provide: DisplayService,
          useValue: {
            getPetriNet$: () => of(parsedPetriNet),
            getPartialOrders$: () => of([]),
          },
        },
        {
          provide: PetriNetRegionsService,
          useValue: {
            layout: jest.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
