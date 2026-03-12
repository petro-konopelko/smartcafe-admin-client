import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { vi } from 'vitest';

setupTestBed();

/**
 * Creates a mock Window object for tests that depend on ThemeService.
 * Provide via `{ provide: WINDOW, useValue: createMockWindow() }` in TestBed providers
 * instead of patching the native window object.
 *
 * @param prefersDark - When true, `matchMedia('(prefers-color-scheme: dark)').matches` returns true.
 */
export function createMockWindow(prefersDark = false): Partial<Window> {
  return {
    matchMedia: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })),
    localStorage: {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    } as Storage
  };
}
