import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairMenuComponent } from './repair-menu.component';

describe('RepairMenuComponent', () => {
  let component: RepairMenuComponent;
  let fixture: ComponentFixture<RepairMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepairMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
