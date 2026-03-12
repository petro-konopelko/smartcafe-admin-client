import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService, LIGHT_THEME_NAME, DARK_THEME_NAME } from './theme.service';
import { LocalStorageService, WINDOW } from '@smartcafe/admin/shared/utils';
import { createMockWindow } from '../../test-setup';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  function configure(options: { savedTheme?: string | null; prefersDark?: boolean } = {}): void {
    const { savedTheme = null, prefersDark = false } = options;

    localStorageSpy = {
      get: vi.fn().mockReturnValue(savedTheme),
      set: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: WINDOW, useValue: createMockWindow(prefersDark) }
      ]
    });

    service = TestBed.inject(ThemeService);
  }

  describe('with no saved preference and light system preference', () => {
    beforeEach(() => configure());

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to light theme', () => {
      expect(service.currentTheme()).toBe(LIGHT_THEME_NAME);
    });

    it('should toggle from light to dark', () => {
      service.toggleTheme();
      expect(service.currentTheme()).toBe(DARK_THEME_NAME);
    });

    it('should persist toggled theme to localStorage', () => {
      service.toggleTheme();
      expect(localStorageSpy.set).toHaveBeenCalledWith('smartcafe-theme', DARK_THEME_NAME);
    });
  });

  describe('with saved dark theme in localStorage', () => {
    beforeEach(() => configure({ savedTheme: DARK_THEME_NAME }));

    it('should load saved dark theme', () => {
      expect(service.currentTheme()).toBe(DARK_THEME_NAME);
    });

    it('should toggle from dark to light', () => {
      service.toggleTheme();
      expect(service.currentTheme()).toBe(LIGHT_THEME_NAME);
    });

    it('should persist toggled theme to localStorage', () => {
      service.toggleTheme();
      expect(localStorageSpy.set).toHaveBeenCalledWith('smartcafe-theme', LIGHT_THEME_NAME);
    });
  });

  describe('with saved light theme in localStorage', () => {
    beforeEach(() => configure({ savedTheme: LIGHT_THEME_NAME }));

    it('should load saved light theme', () => {
      expect(service.currentTheme()).toBe(LIGHT_THEME_NAME);
    });
  });

  describe('with dark system preference and no saved theme', () => {
    beforeEach(() => configure({ prefersDark: true }));

    it('should fall back to dark theme from system preference', () => {
      expect(service.currentTheme()).toBe(DARK_THEME_NAME);
    });
  });
});
