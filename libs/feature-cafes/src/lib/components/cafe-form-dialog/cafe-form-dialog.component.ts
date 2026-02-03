import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CafeStore } from '../../store/cafe.store';

@Component({
  selector: 'sc-cafe-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './cafe-form-dialog.component.html',
  styleUrl: './cafe-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CafeFormDialogComponent>);
  protected readonly cafeStore = inject(CafeStore);

  protected readonly isSubmitting = this.cafeStore.loading;

  protected readonly cafeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    contactInfo: ['', [Validators.maxLength(500)]],
  });

  protected async onSubmit(): Promise<void> {
    if (this.cafeForm.valid) {
      const formValue = this.cafeForm.value;
      if (!formValue.name) return;

      const result = await this.cafeStore.createCafe({
        name: formValue.name,
        contactInfo: formValue.contactInfo || null,
      });

      if (result) {
        this.dialogRef.close(result);
      }
    }
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
