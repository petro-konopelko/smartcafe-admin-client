import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

export interface MenuCloneDialogData {
  menuName: string;
}

export interface MenuCloneDialogResult {
  newName: string;
}

@Component({
  selector: 'sc-menu-clone-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule
  ],
  templateUrl: './menu-clone-dialog.component.html',
  styleUrl: './menu-clone-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuCloneDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<MenuCloneDialogComponent>);
  protected readonly data = inject<MenuCloneDialogData>(MAT_DIALOG_DATA);

  protected readonly isSubmitting = signal(false);

  protected readonly form = this.fb.group({
    newName: [`${this.data.menuName} (Copy)`, [Validators.required, Validators.maxLength(200)]]
  });

  protected onClone(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result: MenuCloneDialogResult = {
      newName: this.form.value.newName!
    };

    this.dialogRef.close(result);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
