import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MenuStore } from '../../store/menu.store';
import { MenuState, MenuSummaryDto } from '../../models';
import {
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorMessageComponent,
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@smartcafe/admin/shared/ui';
import { ScLocalDatePipe } from '@smartcafe/admin/shared/utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'sc-menu-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslateModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    ScLocalDatePipe,
  ],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuListComponent {
  protected readonly menuStore = inject(MenuStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly cafeId = toSignal(this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? '')));
  protected readonly MenuState = MenuState;

  constructor() {
    effect(() => {
      const id = this.cafeId();
      // Only track cafeId changes, not store signals
      if (id) {
        untracked(() => {
          this.menuStore.loadMenus(id);
        });
      }
    });
  }

  protected onBack(): void {
    this.router.navigate(['/cafes']);
  }

  protected onCreateMenu(): void {
    const cafeId = this.cafeId();
    if (!cafeId) return;

    this.router.navigate(['/cafes', cafeId, 'menus', 'new']);
  }

  protected onEdit(menu: MenuSummaryDto): void {
    const cafeId = this.cafeId();
    if (!cafeId) return;

    this.router.navigate(['/cafes', cafeId, 'menus', menu.menuId, 'edit']);
  }

  protected onPreview(menu: MenuSummaryDto): void {
    const cafeId = this.cafeId();
    if (!cafeId) return;

    this.router.navigate(['/cafes', cafeId, 'menus', menu.menuId, 'preview']);
  }

  protected async onPublish(menu: MenuSummaryDto): Promise<void> {
    const confirmed = await this.confirm(
      'Publish Menu',
      `Publish "${menu.name}"? It will be available for activation.`,
    );

    if (confirmed) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.publishMenu(cafeId, menu.menuId);
      }
    }
  }

  protected async onActivate(menu: MenuSummaryDto): Promise<void> {
    const confirmed = await this.confirm(
      'Activate Menu',
      `Activate "${menu.name}"? The current active menu will be deactivated.`,
      false,
    );

    if (confirmed) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.activateMenu(cafeId, menu.menuId);
      }
    }
  }

  protected async onClone(menu: MenuSummaryDto): Promise<void> {
    // TODO: Implement clone dialog with name input
    const newName = prompt('Enter name for cloned menu:', `${menu.name} (Copy)`);
    if (newName) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.cloneMenu(cafeId, menu.menuId, newName);
      }
    }
  }

  protected async onDelete(menu: MenuSummaryDto): Promise<void> {
    const confirmed = await this.confirm(
      'Delete Menu',
      `Delete "${menu.name}"? This action cannot be undone.`,
      true,
    );

    if (confirmed) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.deleteMenu(cafeId, menu.menuId);
      }
    }
  }

  protected getStateLabel(state: MenuState): string {
    const labels = {
      [MenuState.Draft]: 'menus.states.draft',
      [MenuState.Published]: 'menus.states.published',
      [MenuState.Active]: 'menus.states.active',
    };
    return labels[state] || 'menus.states.draft';
  }

  private async confirm(title: string, message: string, isDangerous = false): Promise<boolean> {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: { title, message, isDangerous },
      },
    );
    const result = await firstValueFrom(dialogRef.afterClosed());
    return result || false;
  }
}
