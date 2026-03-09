import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MenuStore } from '../../store/menu.store';
import { PriceUnit } from '../../models';
import {
  ContentContainerComponent,
  ErrorMessageComponent,
  PriceSummaryComponent
} from '@smartcafe/admin/shared/ui';

@Component({
  selector: 'sc-menu-preview-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule,
    ContentContainerComponent,
    ErrorMessageComponent,
    PriceSummaryComponent
  ],
  templateUrl: './menu-preview-page.component.html',
  styleUrl: './menu-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuPreviewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  protected readonly menuStore = inject(MenuStore);

  protected readonly cafeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? ''))
  );
  protected readonly menuId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('menuId') ?? ''))
  );

  constructor() {
    effect(() => {
      const cafeId = this.cafeId();
      const menuId = this.menuId();
      if (cafeId && menuId) {
        untracked(() => {
          this.menuStore.selectMenu(cafeId, menuId);
        });
      }
    });
  }

  protected getFinalPrice(price: { amount: number; discountPercent: number }): number {
    return price.amount * (1 - price.discountPercent / 100);
  }

  protected getUnitLabel(unit: PriceUnit): string {
    return unit === PriceUnit.Per100Grams ? this.translate.instant('menus.form.unit100gShort') : '';
  }

  protected onBack(): void {
    const cafeId = this.cafeId();
    if (cafeId) {
      this.router.navigate(['/cafes', cafeId, 'menus']);
    }
  }

  protected onEdit(): void {
    const cafeId = this.cafeId();
    const menuId = this.menuId();
    if (cafeId && menuId) {
      this.router.navigate(['/cafes', cafeId, 'menus', menuId, 'edit']);
    }
  }
}
