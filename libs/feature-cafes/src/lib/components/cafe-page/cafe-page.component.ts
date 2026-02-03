import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CafeListComponent } from '../cafe-list/cafe-list.component';
import { CafeFormDialogComponent } from '../cafe-form-dialog/cafe-form-dialog.component';

@Component({
  selector: 'sc-cafe-page',
  imports: [CafeListComponent],
  template: ` <sc-cafe-list (createCafe)="onCreateCafe()" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafePageComponent {
  private readonly dialog = inject(MatDialog);

  protected onCreateCafe(): void {
    this.dialog.open(CafeFormDialogComponent, {
      width: '500px',
      disableClose: true,
    });
  }
}
