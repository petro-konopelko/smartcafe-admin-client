import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MenuStore } from '../../store/menu.store';
import { LocaleService } from '@smartcafe/admin/shared/data-access';
import { PriceUnit } from '../../models';

@Component({
  selector: 'sc-menu-preview-page',
  imports: [MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './menu-preview-page.component.html',
  styleUrl: './menu-preview-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuPreviewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly menuStore = inject(MenuStore);
  protected readonly localeService = inject(LocaleService);

  protected readonly cafeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('cafeId') ?? ''))
  );
  protected readonly menuId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('menuId') ?? ''))
  );

  protected readonly PriceUnit = PriceUnit;

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

  protected getFormattedPrice(price: {
    amount: number;
    unit: PriceUnit;
    discountPercent: number;
  }): string {
    const formatter = new Intl.NumberFormat(this.localeService.currentLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const finalPrice = price.amount * (1 - price.discountPercent / 100);
    return formatter.format(finalPrice);
  }

  protected getOriginalPrice(price: {
    amount: number;
    unit: PriceUnit;
    discountPercent: number;
  }): string {
    const formatter = new Intl.NumberFormat(this.localeService.currentLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return formatter.format(price.amount);
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
