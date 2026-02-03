import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have medium size by default', () => {
    expect(component.size()).toBe('medium');
  });

  it('should handle small size', () => {
    fixture.componentRef.setInput('size', 'small');
    expect(component.size()).toBe('small');
  });

  it('should handle large size', () => {
    fixture.componentRef.setInput('size', 'large');
    expect(component.size()).toBe('large');
  });
});
