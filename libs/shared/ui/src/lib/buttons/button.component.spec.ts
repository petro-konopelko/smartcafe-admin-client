import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default variant as filled', () => {
    expect(component.variant()).toBe('filled');
  });

  it('should have default type as button', () => {
    expect(component.type()).toBe('button');
  });

  it('should render with correct variant class', () => {
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.classList.contains('btn-outlined')).toBe(true);
  });

  it('should emit clicked event when button is clicked', () => {
    const clickSpy = vi.fn();
    component.clicked.subscribe(clickSpy);

    const button = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should not emit clicked event when button is disabled', () => {
    const clickSpy = vi.fn();
    component.clicked.subscribe(clickSpy);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button?.click();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should set aria-label when provided', () => {
    const ARIA_LABEL = 'Delete item';
    fixture.componentRef.setInput('ariaLabel', ARIA_LABEL);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe(ARIA_LABEL);
  });

  it('should apply full-width class when fullWidth is true', () => {
    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.classList.contains('full-width')).toBe(true);
  });

  it.each([
    { variant: 'filled' as const, expectedClass: 'btn-filled' },
    { variant: 'outlined' as const, expectedClass: 'btn-outlined' },
    { variant: 'text' as const, expectedClass: 'btn-text' },
    { variant: 'icon' as const, expectedClass: 'btn-icon' }
  ])('should render $variant variant with $expectedClass class', ({ variant, expectedClass }) => {
    fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.classList.contains(expectedClass)).toBe(true);
  });

  it('should set disabled attribute when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-disabled')).toBe('true');
  });
});
