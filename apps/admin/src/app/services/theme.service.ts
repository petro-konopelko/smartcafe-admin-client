import { DOCUMENT } from '@angular/common';
import { Injectable, signal, inject } from '@angular/core';
import { LocalStorageService, WINDOW } from '@smartcafe/admin/shared/utils';

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
  private readonly localStorage = inject(LocalStorageService);

  private readonly themeMap: Map<Theme, () => void> = new Map([
    [LIGHT_THEME_NAME, () => this.document.documentElement.classList.remove(this.DARK_CLASS)],
    [DARK_THEME_NAME, () => this.document.documentElement.classList.add(this.DARK_CLASS)]
  ]);

  readonly currentTheme = signal<Theme>(this.loadTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === LIGHT_THEME_NAME ? DARK_THEME_NAME : LIGHT_THEME_NAME;
    this.currentTheme.set(newTheme);
    this.applyTheme(newTheme);
    this.localStorage.set(this.STORAGE_KEY, newTheme);
  }

  private applyTheme(theme: Theme): void {
    this.themeMap.get(theme)?.();
  }

  private loadTheme(): Theme {
    const saved = this.localStorage.get(this.STORAGE_KEY) as Theme | null;
    if (saved === LIGHT_THEME_NAME || saved === DARK_THEME_NAME) {
      return saved;
    }

    // Check system preference
    const prefersDark = this.window?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? DARK_THEME_NAME : LIGHT_THEME_NAME;
  }
}
