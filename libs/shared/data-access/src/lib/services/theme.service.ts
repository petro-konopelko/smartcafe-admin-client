import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'smartcafe-theme';
  private readonly DARK_CLASS = 'dark-theme';

  readonly currentTheme = signal<Theme>(this.loadTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.currentTheme());

    // Watch for theme changes and apply them
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.saveTheme(theme);
    });
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add(this.DARK_CLASS);
    } else {
      htmlElement.classList.remove(this.DARK_CLASS);
    }
  }

  private loadTheme(): Theme {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'light';
    }

    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }
}
