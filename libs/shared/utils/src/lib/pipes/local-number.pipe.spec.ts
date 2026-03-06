import { describe, it, expect, beforeEach } from 'vitest';
import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScLocalNumberPipe } from './local-number.pipe';
import {
  LocaleService,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale
} from '@smartcafe/admin/shared/data-access';

describe('ScLocalNumberPipe', () => {
  let pipe: ScLocalNumberPipe;
  let localeSignal: WritableSignal<SupportedLocale>;

  beforeEach(() => {
    localeSignal = signal<SupportedLocale>(DEFAULT_LOCALE);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocaleService,
          useValue: { currentLocale: localeSignal } as Partial<LocaleService>
        }
      ]
    });

    pipe = TestBed.runInInjectionContext(() => new ScLocalNumberPipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it.each([
    { input: null, description: 'null' },
    { input: undefined, description: 'undefined' }
  ])('should return empty string for $description', ({ input }) => {
    expect(pipe.transform(input)).toBe('');
  });

  it.each([
    { value: 0, expected: '0' },
    { value: 1234, expected: '1,234' },
    { value: 1234567.89, expected: '1,234,567.89' },
    { value: -42, expected: '-42' },
    { value: 0.123, expected: '0.123' }
  ])('should format $value as $expected in en-US', ({ value, expected }) => {
    expect(pipe.transform(value)).toBe(expected);
  });

  it('should apply custom NumberFormat options', () => {
    const options: Intl.NumberFormatOptions = { style: 'percent' };
    const result = pipe.transform(0.75, options);
    const expected = new Intl.NumberFormat(DEFAULT_LOCALE, options).format(0.75);

    expect(result).toBe(expected);
  });

  it('should format with unit option', () => {
    const options: Intl.NumberFormatOptions = { style: 'unit', unit: 'kilogram' };
    const result = pipe.transform(5, options);
    const expected = new Intl.NumberFormat(DEFAULT_LOCALE, options).format(5);

    expect(result).toBe(expected);
  });

  it('should change output when locale changes', () => {
    const value = 1234.56;
    const enResult = pipe.transform(value);

    localeSignal.set(SUPPORTED_LOCALES.UK_UA);
    const ukResult = pipe.transform(value);

    expect(enResult).not.toBe(ukResult);
  });
});
