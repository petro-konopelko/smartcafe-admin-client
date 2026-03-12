import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LocaleService, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.service';
import { LocalStorageService } from '@smartcafe/admin/shared/utils';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('LocaleService', () => {
  let service: LocaleService;
  let localStorageMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorageMock = { get: vi.fn().mockReturnValue(null), set: vi.fn(), remove: vi.fn() };
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        LocaleService,
        TranslateService,
        { provide: LocalStorageService, useValue: localStorageMock }
      ]
    });
  });

  describe('with empty storage', () => {
    beforeEach(() => {
      service = TestBed.inject(LocaleService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should use default locale', () => {
      expect(service.currentLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should change locale and persist it to storage', () => {
      service.setLocale(SUPPORTED_LOCALES.UK_UA);

      expect(service.currentLocale()).toBe(SUPPORTED_LOCALES.UK_UA);
      expect(localStorageMock.set).toHaveBeenCalledWith(
        'smartcafe-locale',
        SUPPORTED_LOCALES.UK_UA
      );
    });

    it('should not persist to storage when locale is unchanged', () => {
      service.setLocale(DEFAULT_LOCALE);

      expect(localStorageMock.set).not.toHaveBeenCalled();
    });

    it('should return correct currency for current locale', () => {
      expect(service.getCurrency()).toBe('USD');

      service.setLocale(SUPPORTED_LOCALES.UK_UA);

      expect(service.getCurrency()).toBe('UAH');
    });
  });

  describe('with a valid locale in storage', () => {
    beforeEach(() => {
      localStorageMock.get.mockReturnValue(SUPPORTED_LOCALES.UK_UA);
      service = TestBed.inject(LocaleService);
    });

    it('should restore locale from storage on initialization', () => {
      expect(service.currentLocale()).toBe(SUPPORTED_LOCALES.UK_UA);
    });
  });

  describe('with an invalid locale in storage', () => {
    beforeEach(() => {
      localStorageMock.get.mockReturnValue('invalid-locale');
      service = TestBed.inject(LocaleService);
    });

    it('should fall back to default locale', () => {
      expect(service.currentLocale()).toBe(DEFAULT_LOCALE);
    });
  });
});
