import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CafeStore } from '../../store/cafe.store';
import { CafeDto } from '../../models';
import {
  ContentContainerComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
  ScLocalDatePipe
} from '@smartcafe/admin/shared/ui';
import { CafeFormDialogComponent } from '../cafe-form-dialog/cafe-form-dialog.component';

@Component({
  selector: 'sc-cafe-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    TranslateModule,
    ContentContainerComponent,
    ScLocalDatePipe
  ],
  templateUrl: './cafe-page.component.html',
  styleUrl: './cafe-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CafePageComponent {
  protected readonly cafeStore = inject(CafeStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly displayedColumns = ['name', 'contact', 'created', 'actions'];

  constructor() {
    // Load cafes on component init
    this.cafeStore.loadCafes();
  }

  protected onCreateCafe(): void {
    this.dialog.open(CafeFormDialogComponent, {
      width: '500px',
      disableClose: true
    });
  }

  protected onViewMenus(cafe: CafeDto): void {
    this.router.navigate(['/cafes', cafe.id, 'menus']);
  }

  protected async onDeleteCafe(cafe: CafeDto): Promise<void> {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Delete Cafe',
          message: `Are you sure you want to delete "${cafe.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          isDangerous: true
        }
      }
    );

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (confirmed) {
      await this.cafeStore.deleteCafe(cafe.id);
    }
  }
}
