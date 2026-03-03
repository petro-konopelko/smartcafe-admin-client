import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'sc-price-summary',
  imports: [DecimalPipe],
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceSummaryComponent {
  readonly originalPrice = input<number>(0);
  readonly finalPrice = input<number>(0);
  readonly discountPercent = input<number>(0);
  readonly currencySymbol = input<string>('');
  readonly unitLabel = input<string>('');

  readonly normalizedDiscount = computed(() => {
    const discount = Number(this.discountPercent()) || 0;
    return Math.max(0, Math.min(100, Math.round(discount)));
  });

  readonly hasDiscount = computed(() => this.normalizedDiscount() > 0);
}
