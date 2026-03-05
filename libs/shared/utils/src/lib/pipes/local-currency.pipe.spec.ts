import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ScLocalCurrencyPipe } from './local-currency.pipe';
import { LocaleService, DEFAULT_LOCALE } from '@smartcafe/admin/shared/data-access';
import { signal } from '@angular/core';

describe('ScLocalCurrencyPipe', () => {
  let pipe: ScLocalCurrencyPipe;
  let mockLocaleService: Partial<LocaleService>;

  beforeEach(() => {
    mockLocaleService = {
      currentLocale: signal(DEFAULT_LOCALE),
      getCurrency: () => 'USD'
    };
    TestBed.configureTestingModule({
      providers: [{ provide: LocaleService, useValue: mockLocaleService }]
    });

    pipe = TestBed.runInInjectionContext(() => new ScLocalCurrencyPipe());
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null, 'USD')).toBe('');
  });

  it('should format currency', () => {
    const result = pipe.transform(100, 'USD');
    expect(result).toContain('100');
  });
});
