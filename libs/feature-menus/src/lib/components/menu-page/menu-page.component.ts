import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuStore } from '../../store/menu.store';
import { MenuState, MenuSummaryDto } from '../../models';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  ContentContainerComponent,
  ScLocalDatePipe
} from '@smartcafe/admin/shared/ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import {
  MenuCloneDialogComponent,
  MenuCloneDialogData,
  MenuCloneDialogResult
} from '../menu-clone-dialog/menu-clone-dialog.component';

@Component({
  selector: 'sc-menu-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTableModule,
    TranslateModule,
    ContentContainerComponent,
    ScLocalDatePipe
  ],
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuPageComponent {
  protected readonly menuStore = inject(MenuStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['name', 'status', 'created', 'actions'];
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
      this.translate.instant('menus.confirm.publishTitle'),
      this.translate.instant('menus.confirm.publishMessage', { name: menu.name })
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
      this.translate.instant('menus.confirm.activateTitle'),
      this.translate.instant('menus.confirm.activateMessage', { name: menu.name }),
      false
    );

    if (confirmed) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.activateMenu(cafeId, menu.menuId);
      }
    }
  }

  protected async onClone(menu: MenuSummaryDto): Promise<void> {
    const dialogRef = this.dialog.open<
      MenuCloneDialogComponent,
      MenuCloneDialogData,
      MenuCloneDialogResult
    >(MenuCloneDialogComponent, { data: { menuName: menu.name } });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result?.newName) {
      const cafeId = this.cafeId();
      if (cafeId) {
        await this.menuStore.cloneMenu(cafeId, menu.menuId, result.newName);
      }
    }
  }

  protected async onDelete(menu: MenuSummaryDto): Promise<void> {
    const confirmed = await this.confirm(
      this.translate.instant('menus.confirm.deleteTitle'),
      this.translate.instant('menus.confirm.deleteMessage', { name: menu.name }),
      true
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
      [MenuState.New]: 'menus.states.new',
      [MenuState.Published]: 'menus.states.published',
      [MenuState.Active]: 'menus.states.active'
    };
    return labels[state] || 'menus.states.new';
  }

  private async confirm(title: string, message: string, isDangerous = false): Promise<boolean> {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: { title, message, isDangerous }
      }
    );
    const result = await firstValueFrom(dialogRef.afterClosed());
    return result || false;
  }
}
