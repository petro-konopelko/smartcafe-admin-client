import { describe, it, expect, beforeEach } from 'vitest';
import { ScLocalNumberPipe } from './local-number.pipe';
import { LocaleService, DEFAULT_LOCALE } from '@smartcafe/admin/shared/data-access';
import { signal } from '@angular/core';

describe('ScLocalNumberPipe', () => {
  let pipe: ScLocalNumberPipe;
  let mockLocaleService: Partial<LocaleService>;

  beforeEach(() => {
    mockLocaleService = {
      currentLocale: signal(DEFAULT_LOCALE),
    };
    pipe = new ScLocalNumberPipe();
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

  it('should format number', () => {
    const result = pipe.transform(1234.56);
    expect(result).toContain('1');
  });
});
