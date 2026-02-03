import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService, SUPPORTED_LOCALES } from '@smartcafe/admin/shared/data-access';

@Component({
  selector: 'sc-language-selector',
  imports: [MatIcon, MatFormFieldModule, MatSelectModule, TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  protected readonly localeService = inject(LocaleService);

  protected onLanguageChange(locale: string): void {
    this.localeService.setLocale(
      locale as (typeof SUPPORTED_LOCALES)[keyof typeof SUPPORTED_LOCALES]
    );
  }
}
