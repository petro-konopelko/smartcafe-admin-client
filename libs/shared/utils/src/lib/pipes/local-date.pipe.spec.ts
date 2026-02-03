import { describe, it, expect, beforeEach } from 'vitest';
import { ScLocalDatePipe } from './local-date.pipe';
import { LocaleService, DEFAULT_LOCALE } from '@smartcafe/admin/shared/data-access';
import { signal } from '@angular/core';

describe('ScLocalDatePipe', () => {
  let pipe: ScLocalDatePipe;
  let mockLocaleService: Partial<LocaleService>;

  beforeEach(() => {
    mockLocaleService = {
      currentLocale: signal(DEFAULT_LOCALE),
    };
    pipe = new ScLocalDatePipe();
    Object.defineProperty(pipe, 'localeService', {
      value: mockLocaleService,
      writable: true,
    });
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should format date', () => {
    const date = new Date('2024-01-01');
    const result = pipe.transform(date);
    expect(result).toContain('2024');
  });
});
