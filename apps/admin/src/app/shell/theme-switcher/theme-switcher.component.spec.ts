import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeSwitcherComponent } from './theme-switcher.component';
import { ThemeService, LIGHT_THEME_NAME, DARK_THEME_NAME } from '../../services/theme.service';
import { setupMatchMediaMock } from '../../../test-setup';

describe('ThemeSwitcherComponent', () => {
  let component: ThemeSwitcherComponent;
  let fixture: ComponentFixture<ThemeSwitcherComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    setupMatchMediaMock();

    await TestBed.configureTestingModule({
      imports: [ThemeSwitcherComponent, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcherComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose currentTheme as a signal from ThemeService', () => {
    expect(component.currentTheme()).toBe(themeService.currentTheme());
  });

  it('should compute label for switching to dark when theme is light', () => {
    expect(component.currentTheme()).toBe(LIGHT_THEME_NAME);
    expect(component.label()).toBe('app.theme.switchToDark');
  });

  it('should compute label for switching to light when theme is dark', () => {
    component.toggleTheme();
    expect(component.currentTheme()).toBe(DARK_THEME_NAME);
    expect(component.label()).toBe('app.theme.switchToLight');
  });

  it('should toggle theme when toggleTheme is called', () => {
    const initial = component.currentTheme();
    component.toggleTheme();
    expect(component.currentTheme()).not.toBe(initial);
  });
});
