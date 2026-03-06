import { DOCUMENT } from '@angular/common';
import { Injectable, signal, effect, inject } from '@angular/core';
import { WINDOW } from '@smartcafe/admin/shared/utils';

export const LIGHT_THEME_NAME = 'light';
export const DARK_THEME_NAME = 'dark';

export type Theme = typeof LIGHT_THEME_NAME | typeof DARK_THEME_NAME;

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'smartcafe-theme';
  private readonly DARK_CLASS = 'dark-mode';

  private readonly document = inject(DOCUMENT);
  private readonly window = inject(WINDOW);

  private readonly themeMap: Map<Theme, () => void> = new Map([
    [LIGHT_THEME_NAME, () => this.document.documentElement.classList.remove(this.DARK_CLASS)],
    [DARK_THEME_NAME, () => this.document.documentElement.classList.add(this.DARK_CLASS)]
  ]);

  readonly currentTheme = signal<Theme>(this.loadTheme());

  constructor() {
    // Watch for theme changes and apply them
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === LIGHT_THEME_NAME ? DARK_THEME_NAME : LIGHT_THEME_NAME;
    this.currentTheme.set(newTheme);
  }

  private applyTheme(theme: Theme): void {
    this.themeMap.get(theme)?.();
  }

  private loadTheme(): Theme {
    if (!this.window || typeof this.window.localStorage === 'undefined') {
      return LIGHT_THEME_NAME;
    }

    const saved = this.window.localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === LIGHT_THEME_NAME || saved === DARK_THEME_NAME) {
      return saved;
    }

    // Check system preference
    const prefersDark = this.window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? DARK_THEME_NAME : LIGHT_THEME_NAME;
  }

  private saveTheme(theme: Theme): void {
    if (!this.window || typeof this.window.localStorage === 'undefined') {
      return;
    }

    this.window.localStorage.setItem(this.STORAGE_KEY, theme);
  }
}
