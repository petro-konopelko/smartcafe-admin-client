import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '@smartcafe/admin/shared/data-access';

@Pipe({
  name: 'scLocalCurrency',
  pure: false,
})
export class ScLocalCurrencyPipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(
    value: number | null | undefined,
    currency?: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const currencyCode = currency || this.localeService.getCurrency();
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat(this.localeService.currentLocale(), {
      ...defaultOptions,
      ...options,
    }).format(value);
  }
}
