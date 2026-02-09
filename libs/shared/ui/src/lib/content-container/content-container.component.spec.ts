import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentContainerComponent } from './content-container.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

describe('ContentContainerComponent', () => {
  let component: ContentContainerComponent;
  let fixture: ComponentFixture<ContentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, LoadingSpinnerComponent, EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading spinner when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('sc-loading-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display empty state when empty is true and not loading', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('empty', true);
    fixture.componentRef.setInput('emptyTitle', 'No Data');
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('sc-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should not display empty state when loading is true even if empty is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('empty', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('sc-loading-spinner');
    const emptyState = fixture.nativeElement.querySelector('sc-empty-state');

    expect(spinner).toBeTruthy();
    expect(emptyState).toBeFalsy();
  });

  it('should display content when neither loading nor empty', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('empty', false);

    // Add content to ng-content
    const content = document.createElement('div');
    content.setAttribute('data-testid', 'content');
    content.textContent = 'Test Content';
    fixture.nativeElement.appendChild(content);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('sc-loading-spinner');
    const emptyState = fixture.nativeElement.querySelector('sc-empty-state');

    expect(spinner).toBeFalsy();
    expect(emptyState).toBeFalsy();
  });

  it('should pass custom empty state properties', () => {
    const emptyIcon = 'store';
    const emptyTitle = 'No Cafes';
    const emptyMessage = 'Create your first cafe';

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('empty', true);
    fixture.componentRef.setInput('emptyIcon', emptyIcon);
    fixture.componentRef.setInput('emptyTitle', emptyTitle);
    fixture.componentRef.setInput('emptyMessage', emptyMessage);
    fixture.detectChanges();

    const emptyComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof EmptyStateComponent
    )?.componentInstance as EmptyStateComponent;

    expect(emptyComponent.icon()).toBe(emptyIcon);
    expect(emptyComponent.title()).toBe(emptyTitle);
    expect(emptyComponent.message()).toBe(emptyMessage);
  });

  it('should pass loading message and size to spinner', () => {
    const loadingMessage = 'Loading cafes...';
    const loadingSize = 'large';

    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('loadingMessage', loadingMessage);
    fixture.componentRef.setInput('loadingSize', loadingSize);
    fixture.detectChanges();

    const spinnerComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof LoadingSpinnerComponent
    )?.componentInstance as LoadingSpinnerComponent;

    expect(spinnerComponent.message()).toBe(loadingMessage);
    expect(spinnerComponent.size()).toBe(loadingSize);
  });
});
