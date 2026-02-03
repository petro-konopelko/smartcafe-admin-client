import { Injectable, signal, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LOCALES = {
  EN_US: 'en-US',
  UK_UA: 'uk-UA',
} as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[keyof typeof SUPPORTED_LOCALES];

export const DEFAULT_LOCALE: SupportedLocale = SUPPORTED_LOCALES.EN_US;

export const LOCALE_CURRENCY_MAP: Record<SupportedLocale, string> = {
  [SUPPORTED_LOCALES.EN_US]: 'USD',
  [SUPPORTED_LOCALES.UK_UA]: 'UAH',
};

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private readonly STORAGE_KEY = 'smartcafe-locale';
  private readonly translate = inject(TranslateService);

  readonly availableLocales = Object.values(SUPPORTED_LOCALES);
  readonly currentLocale = signal<SupportedLocale>(this.getInitialLocale());
  readonly isReady = signal<boolean>(false);

  constructor() {
    // The translate service is already configured in app.config with default language
    // Just add available languages
    this.translate.addLangs(this.availableLocales);

    // If stored locale differs from default, switch to it
    const storedLocale = this.getInitialLocale();
    if (storedLocale !== DEFAULT_LOCALE) {
      this.translate.use(storedLocale).subscribe(() => {
        this.isReady.set(true);
      });
    } else {
      // Already using default language
      this.isReady.set(true);
    }

    // Persist locale changes
    effect(() => {
      const locale = this.currentLocale();
      if (locale !== this.translate.currentLang) {
        localStorage.setItem(this.STORAGE_KEY, locale);
        this.translate.use(locale);
      }
    });
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocale.set(locale);
  }

  getCurrency(): string {
    return LOCALE_CURRENCY_MAP[this.currentLocale()];
  }

  private getInitialLocale(): SupportedLocale {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored && this.isValidLocale(stored)) {
      return stored as SupportedLocale;
    }
    return DEFAULT_LOCALE;
  }

  private isValidLocale(locale: string): boolean {
    return this.availableLocales.includes(locale as SupportedLocale);
  }
}
