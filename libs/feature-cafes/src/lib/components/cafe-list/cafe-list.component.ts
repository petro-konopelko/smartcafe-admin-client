import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CafeStore } from '../../store/cafe.store';
import { CafeDto } from '../../models';
import {
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorMessageComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@smartcafe/admin/shared/ui';
import { ScLocalDatePipe } from '@smartcafe/admin/shared/utils';

@Component({
  selector: 'sc-cafe-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    ScLocalDatePipe,
  ],
  templateUrl: './cafe-list.component.html',
  styleUrl: './cafe-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafeListComponent {
  protected readonly cafeStore = inject(CafeStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly createCafe = output<void>();

  constructor() {
    // Load cafes on component init
    this.cafeStore.loadCafes();
  }

  protected onCreateCafe(): void {
    this.createCafe.emit();
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
          isDangerous: true,
        },
      },
    );

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (confirmed) {
      await this.cafeStore.deleteCafe(cafe.id);
    }
  }
}
