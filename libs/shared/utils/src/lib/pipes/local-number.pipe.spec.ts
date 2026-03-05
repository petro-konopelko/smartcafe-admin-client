import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ScLocalNumberPipe } from './local-number.pipe';
import { LocaleService, DEFAULT_LOCALE } from '@smartcafe/admin/shared/data-access';
import { signal } from '@angular/core';

describe('ScLocalNumberPipe', () => {
  let pipe: ScLocalNumberPipe;
  let mockLocaleService: Partial<LocaleService>;

  beforeEach(() => {
    mockLocaleService = {
      currentLocale: signal(DEFAULT_LOCALE)
    };
    TestBed.configureTestingModule({
      providers: [{ provide: LocaleService, useValue: mockLocaleService }]
    });

    pipe = TestBed.runInInjectionContext(() => new ScLocalNumberPipe());
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
