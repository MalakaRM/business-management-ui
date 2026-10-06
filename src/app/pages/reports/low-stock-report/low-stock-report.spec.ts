import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockReport } from './low-stock-report';

describe('LowStockReport', () => {
  let component: LowStockReport;
  let fixture: ComponentFixture<LowStockReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowStockReport],
    }).compileComponents();

    fixture = TestBed.createComponent(LowStockReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
