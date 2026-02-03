import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LocaleService, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LocaleService,
        TranslateService
      ],
    });
    service = TestBed.inject(LocaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default locale', () => {
    expect(service.currentLocale()).toBe(DEFAULT_LOCALE);
  });

  it('should have available locales', () => {
    expect(service.availableLocales).toEqual(Object.values(SUPPORTED_LOCALES));
  });

  it('should change locale', () => {
    service.setLocale(SUPPORTED_LOCALES.UK_UA);
    expect(service.currentLocale()).toBe(SUPPORTED_LOCALES.UK_UA);
  });
});
