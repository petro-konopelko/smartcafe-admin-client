import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const mockDialogData = {
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'Yes',
    cancelText: 'No'
  };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display dialog title', () => {
    expect(fixture.nativeElement.textContent).toContain('Confirm');
  });

  it('should display dialog message', () => {
    expect(fixture.nativeElement.textContent).toContain('Are you sure?');
  });

  it('should display custom confirm text', () => {
    expect(fixture.nativeElement.textContent).toContain('Yes');
  });

  it('should display custom cancel text', () => {
    expect(fixture.nativeElement.textContent).toContain('No');
  });

  it('should close with true when confirmed', () => {
    component['onConfirm']();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when cancelled', () => {
    component['onCancel']();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
