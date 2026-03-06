import { describe, it, expect, beforeEach } from 'vitest';
import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScLocalCurrencyPipe } from './local-currency.pipe';
import {
  LocaleService,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale
} from '@smartcafe/admin/shared/data-access';

describe('ScLocalCurrencyPipe', () => {
  let pipe: ScLocalCurrencyPipe;
  let localeSignal: WritableSignal<SupportedLocale>;
  let getCurrencyFn: () => string;

  beforeEach(() => {
    localeSignal = signal<SupportedLocale>(DEFAULT_LOCALE);
    getCurrencyFn = () => 'USD';

    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocaleService,
          useValue: {
            currentLocale: localeSignal,
            getCurrency: () => getCurrencyFn()
          } as Partial<LocaleService>
        }
      ]
    });

    pipe = TestBed.runInInjectionContext(() => new ScLocalCurrencyPipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it.each([
    { input: null, description: 'null' },
    { input: undefined, description: 'undefined' }
  ])('should return empty string for $description', ({ input }) => {
    expect(pipe.transform(input, 'USD')).toBe('');
  });

  it('should format with explicit currency code', () => {
    const result = pipe.transform(99.99, 'USD');
    const expected = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(99.99);

    expect(result).toBe(expected);
  });

  it('should fallback to locale currency when no currency provided', () => {
    getCurrencyFn = () => 'EUR';
    const result = pipe.transform(50);
    const expected = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(50);

    expect(result).toBe(expected);
  });

  it.each([
    { value: 0, description: 'zero' },
    { value: 1234567.89, description: 'large number with decimals' },
    { value: 0.5, description: 'less than one' }
  ])('should format $description correctly', ({ value }) => {
    const result = pipe.transform(value, 'USD');
    const expected = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

    expect(result).toBe(expected);
  });

  it('should apply custom number format options', () => {
    const options: Intl.NumberFormatOptions = { minimumFractionDigits: 0 };
    const result = pipe.transform(100, 'USD', options);

    expect(result).toContain('100');
  });

  it('should change output when locale changes', () => {
    const value = 1234.56;
    const enResult = pipe.transform(value, 'UAH');

    localeSignal.set(SUPPORTED_LOCALES.UK_UA);
    const ukResult = pipe.transform(value, 'UAH');

    expect(enResult).not.toBe(ukResult);
  });
});
