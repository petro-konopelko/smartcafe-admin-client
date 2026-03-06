import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { WINDOW } from '@smartcafe/admin/shared/utils';

export const SUPPORTED_LOCALES = {
  EN_US: 'en-US',
  UK_UA: 'uk-UA'
} as const;

export const LOCALES_KEY_VALUES = new Map<string, string>([
  [SUPPORTED_LOCALES.EN_US, 'English'],
  [SUPPORTED_LOCALES.UK_UA, 'Українська']
]);

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[keyof typeof SUPPORTED_LOCALES];

export const DEFAULT_LOCALE: SupportedLocale = SUPPORTED_LOCALES.EN_US;

export const LOCALE_CURRENCY_MAP: Record<SupportedLocale, string> = {
  [SUPPORTED_LOCALES.EN_US]: 'USD',
  [SUPPORTED_LOCALES.UK_UA]: 'UAH'
};

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  private readonly STORAGE_KEY = 'smartcafe-locale';
  private readonly translate = inject(TranslateService);
  private readonly window = inject(WINDOW);

  readonly availableLocales = Object.values(SUPPORTED_LOCALES);
  readonly currentLocale = signal<SupportedLocale>(this.getInitialLocale());
  readonly isReady = signal<boolean>(false);

  constructor() {
    // The translate service is already configured in app.config with default language
    // Just add available languages
    this.translate.addLangs(this.availableLocales);

    this.applyLocale(this.currentLocale(), false);
  }

  setLocale(locale: SupportedLocale): void {
    if (locale === this.currentLocale()) {
      return;
    }

    this.currentLocale.set(locale);
    this.applyLocale(locale, true);
  }

  getCurrency(): string {
    return LOCALE_CURRENCY_MAP[this.currentLocale()];
  }

  private applyLocale(locale: SupportedLocale, persist: boolean): void {
    if (persist) {
      this.setStoredLocale(locale);
    }

    if (locale === this.translate.currentLang) {
      this.isReady.set(true);
      return;
    }

    this.isReady.set(false);
    this.translate
      .use(locale)
      .pipe(take(1))
      .subscribe({
        next: () => this.isReady.set(true),
        error: () => this.isReady.set(true)
      });
  }

  private getInitialLocale(): SupportedLocale {
    const stored = this.getStoredLocale();
    if (stored && this.isValidLocale(stored)) {
      return stored as SupportedLocale;
    }
    return DEFAULT_LOCALE;
  }

  private getStoredLocale(): string | null {
    if (!this.window || typeof this.window.localStorage === 'undefined') {
      return null;
    }

    return this.window.localStorage.getItem(this.STORAGE_KEY);
  }

  private setStoredLocale(locale: SupportedLocale): void {
    if (!this.window || typeof this.window.localStorage === 'undefined') {
      return;
    }

    this.window.localStorage.setItem(this.STORAGE_KEY, locale);
  }

  private isValidLocale(locale: string): boolean {
    return this.availableLocales.includes(locale as SupportedLocale);
  }
}
