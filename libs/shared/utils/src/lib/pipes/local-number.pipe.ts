import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '@smartcafe/admin/shared/data-access';

@Pipe({
  name: 'scLocalNumber',
  pure: false,
})
export class ScLocalNumberPipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
    if (value === null || value === undefined) {
      return '';
    }

    return new Intl.NumberFormat(this.localeService.currentLocale(), options).format(value);
  }
}
