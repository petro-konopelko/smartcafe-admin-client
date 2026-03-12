import { Injectable, inject } from '@angular/core';
import { WINDOW } from '../tokens/window.token';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly window = inject(WINDOW);

  get(key: string): string | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return this.window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      this.window.localStorage.setItem(key, value);
    } catch {
      // no-op: storage may be full (QuotaExceededError) or blocked (SecurityError)
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      this.window.localStorage.removeItem(key);
    } catch {
      // no-op: storage may be blocked (SecurityError)
    }
  }

  /**
   * Accessing window.localStorage itself can throw a SecurityError in some
   * browsers when third-party storage is blocked, so the check must be guarded.
   */
  private isAvailable(): boolean {
    try {
      return !!this.window && typeof this.window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }
}
