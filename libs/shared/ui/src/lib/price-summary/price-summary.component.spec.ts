import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { PriceSummaryComponent } from './price-summary.component';

describe('PriceSummaryComponent', () => {
  let fixture: ComponentFixture<PriceSummaryComponent>;
  let component: PriceSummaryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceSummaryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PriceSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
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

  it.each([
    { discount: -5, expected: 0, description: 'clamp below zero to 0' },
    { discount: 150, expected: 100, description: 'clamp above 100 to 100' },
    { discount: 33.7, expected: 34, description: 'round to nearest integer' },
    { discount: 50, expected: 50, description: 'pass through valid value unchanged' }
  ])('should $description (input=$discount, expected=$expected)', ({ discount, expected }) => {
    fixture.componentRef.setInput('discountPercent', discount);
    fixture.detectChanges();

    expect(component.normalizedDiscount()).toBe(expected);
  });

  it('should display unit label when provided', () => {
    fixture.componentRef.setInput('finalPrice', 5);
    fixture.componentRef.setInput('unitLabel', 'item');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.currency-unit')?.textContent).toContain('/ item');
  });

  it('should hide unit label when empty', () => {
    fixture.componentRef.setInput('finalPrice', 5);
    fixture.componentRef.setInput('unitLabel', '');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.currency-unit')).toBeNull();
  });

  it('should display original price in discount section', () => {
    fixture.componentRef.setInput('originalPrice', 25);
    fixture.componentRef.setInput('finalPrice', 20);
    fixture.componentRef.setInput('discountPercent', 20);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.start-price')?.textContent).toContain('25.00');
  });
});
