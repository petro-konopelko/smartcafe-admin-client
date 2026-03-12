import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { LocalStorageService } from '@smartcafe/admin/shared/utils';

export const SUPPORTED_LOCALES = {
  EN_US: 'en-US',
  UK_UA: 'uk-UA'
} as const;

export const LOCALES_KEY_VALUES = new Map<SupportedLocale, string>([
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
  private readonly localStorage = inject(LocalStorageService);
  private readonly availableLocales = Object.values(SUPPORTED_LOCALES);

  readonly currentLocale = signal<SupportedLocale>(this.getInitialLocale());

  constructor() {
    this.applyLocale(this.currentLocale());
  }

  setLocale(locale: SupportedLocale): void {
    if (locale === this.currentLocale()) {
      return;
    }

    this.currentLocale.set(locale);
    this.applyLocale(locale);
    this.setStoredLocale(locale);
  }

  getCurrency(): string {
    return LOCALE_CURRENCY_MAP[this.currentLocale()];
  }

  private applyLocale(locale: SupportedLocale): void {
    if (locale === this.translate.getCurrentLang()) {
      return;
    }

    this.translate.use(locale).pipe(take(1)).subscribe();
  }

  private getInitialLocale(): SupportedLocale {
    const stored = this.getStoredLocale();
    if (stored && this.isValidLocale(stored)) {
      return stored as SupportedLocale;
    }

    return DEFAULT_LOCALE;
  }

  private getStoredLocale(): string | null {
    return this.localStorage.get(this.STORAGE_KEY);
  }

  private setStoredLocale(locale: SupportedLocale): void {
    this.localStorage.set(this.STORAGE_KEY, locale);
  }

  private isValidLocale(locale: string): boolean {
    return this.availableLocales.includes(locale as SupportedLocale);
  }
}
