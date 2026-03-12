import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { LocaleService } from '@smartcafe/admin/shared/data-access';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let localeService: LocaleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), LocaleService]
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
    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent?.trim()).toBe('language');
  });

  it('should have menu trigger button for language selection', () => {
    const triggerButton = fixture.nativeElement.querySelector('.language-container > button');
    expect(triggerButton).toBeTruthy();
  });

  it('should change language when selection changes', () => {
    const setLocaleSpy = vi.spyOn(localeService, 'setLocale');

    component['onLanguageChange']('uk-UA');

    expect(setLocaleSpy).toHaveBeenCalledWith('uk-UA');
  });

  it('should reflect current locale from service', () => {
    localeService.setLocale('uk-UA');
    fixture.detectChanges();

    const triggerButton = fixture.nativeElement.querySelector('.language-container > button');
    expect(triggerButton).toBeTruthy();
    expect(triggerButton.textContent).toContain('Українська');
  });
});
