import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { CafeFormDialogComponent } from './cafe-form-dialog.component';
import { CafeStore } from '../../store/cafe.store';

describe('CafeFormDialogComponent', () => {
  let component: CafeFormDialogComponent;
  let fixture: ComponentFixture<CafeFormDialogComponent>;
  let mockDialogRef: Partial<MatDialogRef<CafeFormDialogComponent>>;
  let mockCafeStore: {
    loading: ReturnType<typeof signal<boolean>>;
    createCafe: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn()
    };

    mockCafeStore = {
      loading: signal(false),
      createCafe: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CafeFormDialogComponent, MatDialogModule, TranslateModule.forRoot()],
      providers: [
        { provide: CafeStore, useValue: mockCafeStore },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CafeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form', () => {
    expect(component['cafeForm'].valid).toBe(false);

    component['cafeForm'].patchValue({
      name: 'Test Cafe',
      contactInfo: 'test@cafe.com'
    });

    expect(component['cafeForm'].valid).toBe(true);
  });

  it('should mark name as invalid when empty', () => {
    const nameControl = component['cafeForm'].get('name');
    expect(nameControl?.hasError('required')).toBe(true);
  });

  it('should mark name as invalid when exceeds max length', () => {
    const nameControl = component['cafeForm'].get('name');
    nameControl?.setValue('a'.repeat(101));
    expect(nameControl?.hasError('maxlength')).toBe(true);
  });

  it('should not submit when form is invalid', async () => {
    await component['onSubmit']();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with result when form is valid', async () => {
    const createdCafeId = 'new-cafe-id';
    mockCafeStore.createCafe.mockResolvedValue(createdCafeId);

    component['cafeForm'].patchValue({
      name: 'New Cafe',
      contactInfo: 'new@cafe.com'
    });

    await component['onSubmit']();

    expect(mockCafeStore.createCafe).toHaveBeenCalledTimes(1);
    expect(mockDialogRef.close).toHaveBeenCalledWith(createdCafeId);
  });
});
