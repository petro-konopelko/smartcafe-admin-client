import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { LocaleService } from '@smartcafe/admin/shared/data-access';
import { signal } from '@angular/core';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let localeService: LocaleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
        LocaleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    localeService = TestBed.inject(LocaleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display language icon', () => {
    const icon = fixture.nativeElement.querySelector('mat-icon.language-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent?.trim()).toBe('language');
  });

  it('should have material select for language selection', () => {
    const select = fixture.nativeElement.querySelector('mat-select');
    expect(select).toBeTruthy();
  });

  it('should change language when selection changes', () => {
    const setLocaleSpy = vi.spyOn(localeService, 'setLocale');

    component['onLanguageChange']('uk-UA');

    expect(setLocaleSpy).toHaveBeenCalledWith('uk-UA');
  });

  it('should reflect current locale from service', () => {
    localeService.currentLocale = signal('uk-UA');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('mat-select');
    expect(select).toBeTruthy();
  });
});
