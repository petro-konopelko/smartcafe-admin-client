import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { WINDOW } from '../tokens/window.token';

const STORAGE_KEY = 'test-key';
const STORAGE_VALUE = 'test-value';

function buildLocalStorageMock(overrides: Partial<Storage> = {}): Storage {
  return {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
    ...overrides
  } as Storage;
}

function configure(windowValue: Partial<Window> | null): LocalStorageService {
  TestBed.configureTestingModule({
    providers: [LocalStorageService, { provide: WINDOW, useValue: windowValue }]
  });
  return TestBed.inject(LocalStorageService);
}

describe('LocalStorageService', () => {
  describe('get()', () => {
    it('should return stored value when available', () => {
      const storage = buildLocalStorageMock({
        getItem: vi.fn().mockReturnValue(STORAGE_VALUE)
      });
      const service = configure({ localStorage: storage });

      expect(service.get(STORAGE_KEY)).toBe(STORAGE_VALUE);
      expect(storage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return null when key is not found', () => {
      const service = configure({ localStorage: buildLocalStorageMock() });

      expect(service.get(STORAGE_KEY)).toBeNull();
    });

    it('should return null when window is falsy', () => {
      const service = configure(null);

      expect(service.get(STORAGE_KEY)).toBeNull();
    });

    it('should return null when getItem throws (SecurityError)', () => {
      const storage = buildLocalStorageMock({
        getItem: vi.fn().mockImplementation(() => {
          throw new DOMException('Blocked', 'SecurityError');
        })
      });
      const service = configure({ localStorage: storage });

      expect(service.get(STORAGE_KEY)).toBeNull();
    });
  });

  describe('set()', () => {
    it('should write value to storage', () => {
      const storage = buildLocalStorageMock();
      const service = configure({ localStorage: storage });

      service.set(STORAGE_KEY, STORAGE_VALUE);

      expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, STORAGE_VALUE);
    });

    it('should no-op when window is falsy', () => {
      const service = configure(null);

      expect(() => service.set(STORAGE_KEY, STORAGE_VALUE)).not.toThrow();
    });

    it('should no-op when setItem throws QuotaExceededError', () => {
      const storage = buildLocalStorageMock({
        setItem: vi.fn().mockImplementation(() => {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        })
      });
      const service = configure({ localStorage: storage });

      expect(() => service.set(STORAGE_KEY, STORAGE_VALUE)).not.toThrow();
    });

    it('should no-op when setItem throws SecurityError', () => {
      const storage = buildLocalStorageMock({
        setItem: vi.fn().mockImplementation(() => {
          throw new DOMException('Blocked', 'SecurityError');
        })
      });
      const service = configure({ localStorage: storage });

      expect(() => service.set(STORAGE_KEY, STORAGE_VALUE)).not.toThrow();
    });
  });

  describe('remove()', () => {
    it('should remove value from storage', () => {
      const storage = buildLocalStorageMock();
      const service = configure({ localStorage: storage });

      service.remove(STORAGE_KEY);

      expect(storage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should no-op when window is falsy', () => {
      const service = configure(null);

      expect(() => service.remove(STORAGE_KEY)).not.toThrow();
    });

    it('should no-op when removeItem throws SecurityError', () => {
      const storage = buildLocalStorageMock({
        removeItem: vi.fn().mockImplementation(() => {
          throw new DOMException('Blocked', 'SecurityError');
        })
      });
      const service = configure({ localStorage: storage });

      expect(() => service.remove(STORAGE_KEY)).not.toThrow();
    });
  });

  describe('isAvailable() (via storage operations)', () => {
    it('should treat storage as unavailable when accessing localStorage property throws', () => {
      const windowWithThrowingStorage = Object.defineProperty({}, 'localStorage', {
        get() {
          throw new DOMException('Blocked', 'SecurityError');
        }
      }) as Window;

      const service = configure(windowWithThrowingStorage);

      // All operations silently return null / no-op when unavailable
      expect(service.get(STORAGE_KEY)).toBeNull();
      expect(() => service.set(STORAGE_KEY, STORAGE_VALUE)).not.toThrow();
      expect(() => service.remove(STORAGE_KEY)).not.toThrow();
    });
  });
});
