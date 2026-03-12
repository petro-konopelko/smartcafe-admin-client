import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuCloneDialogComponent, MenuCloneDialogData } from './menu-clone-dialog.component';

const mockDialogData: MenuCloneDialogData = {
  menuName: 'Original Menu'
};

describe('MenuCloneDialogComponent', () => {
  let component: MenuCloneDialogComponent;
  let fixture: ComponentFixture<MenuCloneDialogComponent>;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MenuCloneDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuCloneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pre-fill the new name with (Copy) suffix', () => {
    const nameInput = fixture.nativeElement.querySelector(
      '[data-testid="clone-name-input"]'
    ) as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe(`${mockDialogData.menuName} (Copy)`);
  });

  it('should have an input for the new menu name', () => {
    const nameInput = fixture.nativeElement.querySelector('[data-testid="clone-name-input"]');
    expect(nameInput).toBeTruthy();
  });

  it('should have cancel and confirm buttons', () => {
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="cancel-clone-button"]');
    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirm-clone-button"]');
    expect(cancelBtn).toBeTruthy();
    expect(confirmBtn).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="cancel-clone-button"]');
    cancelBtn?.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should close dialog with result on confirm when form is valid', () => {
    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirm-clone-button"]');
    confirmBtn?.click();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      newName: `${mockDialogData.menuName} (Copy)`
    });
  });
});
