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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LocaleService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    component = fixture.componentInstance;
    localeService = TestBed.inject(LocaleService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown when toggle method is called', () => {
    expect(component['isOpen']()).toBe(false);

    component['toggleDropdown']();
    
    expect(component['isOpen']()).toBe(true);
    
    component['toggleDropdown']();
    
    expect(component['isOpen']()).toBe(false);
  });

  it('should display current language name', () => {
    const button = fixture.nativeElement.querySelector('.dropdown-trigger span');
    expect(button?.textContent).toContain('English');
  });

  it('should change language when dropdown item is clicked', () => {
    const setLocaleSpy = vi.spyOn(localeService, 'setLocale');
    
    component['toggleDropdown']();
    fixture.detectChanges();

    const ukrainianOption = Array.from(fixture.nativeElement.querySelectorAll('.dropdown-item'))
      .find((el: Element) => el.textContent?.includes('Українська')) as HTMLElement;
    
    ukrainianOption?.click();
    fixture.detectChanges();

    expect(setLocaleSpy).toHaveBeenCalledWith('uk-UA');
    expect(component['isOpen']()).toBe(false);
  });

  it('should close dropdown when clicking outside', () => {
    component['toggleDropdown']();
    fixture.detectChanges();
    expect(component['isOpen']()).toBe(true);

    const event = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(event);

    expect(component['isOpen']()).toBe(false);
  });
});
