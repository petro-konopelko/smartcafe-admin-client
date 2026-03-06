import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Test error');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display error message', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Test error');
  });

  it('should display default title when none provided', () => {
    expect(component.title()).toBe('Error');
    expect(fixture.nativeElement.textContent).toContain('Error');
  });

  it('should display custom title when provided', () => {
    fixture.componentRef.setInput('title', 'Connection Failed');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Connection Failed');
  });

  it('should display default message when none provided', async () => {
    const freshFixture = TestBed.createComponent(ErrorMessageComponent);
    freshFixture.detectChanges();

    expect(freshFixture.componentInstance.message()).toBe('An error occurred. Please try again.');
  });

  it('should render error_outline icon', () => {
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent).toContain('error_outline');
  });
});
