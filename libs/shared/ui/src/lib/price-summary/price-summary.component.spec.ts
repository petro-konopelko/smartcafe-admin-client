import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { PriceSummaryComponent } from './price-summary.component';

describe('PriceSummaryComponent', () => {
  let fixture: ComponentFixture<PriceSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceSummaryComponent);
  });

  it('should hide discount info when discount is zero', () => {
    fixture.componentRef.setInput('originalPrice', 10);
    fixture.componentRef.setInput('finalPrice', 10);
    fixture.componentRef.setInput('discountPercent', 0);
    fixture.componentRef.setInput('unitLabel', 'item');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.summary-top')).toBeNull();
    expect(host.querySelector('.final-price')?.textContent).toContain('10.00');
  });

  it('should show discount info when discount is greater than zero', () => {
    fixture.componentRef.setInput('originalPrice', 10);
    fixture.componentRef.setInput('finalPrice', 8);
    fixture.componentRef.setInput('discountPercent', 20);
    fixture.componentRef.setInput('unitLabel', 'item');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.summary-top')).not.toBeNull();
    expect(host.querySelector('.discount-badge')?.textContent).toContain('-20%');
  });
});
