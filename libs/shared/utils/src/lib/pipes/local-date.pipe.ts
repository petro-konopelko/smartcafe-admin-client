import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from '@smartcafe/admin/shared/data-access';

@Pipe({
  name: 'scLocalDate',
  pure: false,
})
export class ScLocalDatePipe implements PipeTransform {
  private localeService = inject(LocaleService);

  transform(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(
      this.localeService.currentLocale(),
      options || defaultOptions,
    ).format(date);
  }
}
