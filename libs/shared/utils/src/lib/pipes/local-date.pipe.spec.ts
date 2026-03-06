import { describe, it, expect, beforeEach } from 'vitest';
import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScLocalDatePipe } from './local-date.pipe';
import {
  LocaleService,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale
} from '@smartcafe/admin/shared/data-access';

describe('ScLocalDatePipe', () => {
  let pipe: ScLocalDatePipe;
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

    pipe = TestBed.runInInjectionContext(() => new ScLocalDatePipe());
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

  it('should format a Date object with default options', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    const result = pipe.transform(date);

    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('should format a string date', () => {
    const result = pipe.transform('2024-06-15T12:00:00Z');

    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('should apply custom DateTimeFormat options', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    const result = pipe.transform(date, options);
    const expected = new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(date);

    expect(result).toBe(expected);
  });

  it('should use default options when none provided', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    const expected = new Intl.DateTimeFormat(DEFAULT_LOCALE, defaultOptions).format(date);

    expect(pipe.transform(date)).toBe(expected);
  });

  it('should change output when locale changes', () => {
    const date = new Date('2024-06-15T12:00:00Z');

    const enResult = pipe.transform(date);

    localeSignal.set(SUPPORTED_LOCALES.UK_UA);
    const ukResult = pipe.transform(date);

    expect(enResult).not.toBe(ukResult);
  });
});
