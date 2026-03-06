import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([
    { size: 'small' as const, expectedDiameter: 24 },
    { size: 'medium' as const, expectedDiameter: 48 },
    { size: 'large' as const, expectedDiameter: 72 }
  ])('should compute diameter $expectedDiameter for size "$size"', ({ size, expectedDiameter }) => {
    fixture.componentRef.setInput('size', size);
    expect(component['diameter']()).toBe(expectedDiameter);
  });

  it('should have medium size by default', () => {
    expect(component.size()).toBe('medium');
  });

  it('should not display message by default', () => {
    const messageEl = fixture.nativeElement.querySelector('.spinner-message');
    expect(messageEl).toBeNull();
  });

  it('should display message when provided', () => {
    fixture.componentRef.setInput('message', 'Loading data...');
    fixture.detectChanges();

    const messageEl = fixture.nativeElement.querySelector('.spinner-message');
    expect(messageEl).toBeTruthy();
    expect(messageEl.textContent).toContain('Loading data...');
  });
});
