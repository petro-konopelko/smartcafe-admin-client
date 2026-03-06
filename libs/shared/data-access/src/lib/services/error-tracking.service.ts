import { Injectable } from '@angular/core';

const DEDUP_WINDOW_MS = 5000;
const CLEANUP_DELAY_MS = 10000;

/**
 * Tracks recently shown HTTP error messages to prevent duplicate snackbar notifications.
 *
 * Replaces the module-level Set that was previously used in the error interceptor,
 * making error deduplication injectable and testable.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService {
  private readonly shownErrors = new Set<string>();

  /**
   * Returns true if this error has already been shown recently (within the dedup window).
   * If not, registers it and schedules cleanup.
   */
  isRecentlyShown(url: string, status: number): boolean {
    const baseErrorKey = `${url}-${status}`;
    const now = Date.now();

    const recentlyShown = Array.from(this.shownErrors).some(
      (key) =>
        key.startsWith(baseErrorKey) &&
        now - parseInt(key.split('-').pop() || '0') < DEDUP_WINDOW_MS
    );

    if (!recentlyShown) {
      const errorKey = `${baseErrorKey}-${now}`;
      this.shownErrors.add(errorKey);
      setTimeout(() => this.shownErrors.delete(errorKey), CLEANUP_DELAY_MS);
    }

    return recentlyShown;
  }

  /** Clears all tracked errors. Useful for testing. */
  clear(): void {
    this.shownErrors.clear();
  }
}
