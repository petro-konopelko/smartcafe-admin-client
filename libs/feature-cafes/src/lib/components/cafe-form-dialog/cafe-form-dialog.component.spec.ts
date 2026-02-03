import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CafeFormDialogComponent } from './cafe-form-dialog.component';
import { CafeStore } from '../../store/cafe.store';

describe('CafeFormDialogComponent', () => {
  let component: CafeFormDialogComponent;
  let fixture: ComponentFixture<CafeFormDialogComponent>;
  let mockDialogRef: Partial<MatDialogRef<CafeFormDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CafeFormDialogComponent, MatDialogModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        CafeStore,
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
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
      contactInfo: 'test@cafe.com',
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
});
