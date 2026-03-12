import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {
  LOCALES_KEY_VALUES,
  LocaleService,
  SupportedLocale
} from '@smartcafe/admin/shared/data-access';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'sc-language-selector',
  imports: [KeyValuePipe, MatIcon, MatMenuModule, MatTooltip, TranslateModule, MatButtonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSelectorComponent {
  protected readonly supportedLocales = LOCALES_KEY_VALUES;
  protected readonly localeService = inject(LocaleService);
  protected readonly label = 'app.language.select';

  protected onLanguageChange(locale: SupportedLocale): void {
    this.localeService.setLocale(locale);
  }
}
