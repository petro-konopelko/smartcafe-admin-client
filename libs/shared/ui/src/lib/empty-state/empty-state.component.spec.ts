import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'No data');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    expect(fixture.nativeElement.textContent).toContain('No data');
  });

  it('should display default icon', () => {
    expect(component.icon()).toBe('inbox');
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent).toContain('inbox');
  });

  it('should display custom icon when provided', () => {
    fixture.componentRef.setInput('icon', 'store');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent).toContain('store');
  });

  it('should display default title', () => {
    expect(component.title()).toBe('No items found');
    expect(fixture.nativeElement.textContent).toContain('No items found');
  });

  it('should display custom title when provided', () => {
    fixture.componentRef.setInput('title', 'No cafes yet');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No cafes yet');
  });

  it('should render empty message when none provided', () => {
    fixture.componentRef.setInput('message', '');
    fixture.detectChanges();

    const p = fixture.nativeElement.querySelector('p');
    expect(p.textContent.trim()).toBe('');
  });
});
