import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ErrorTrackingService } from './error-tracking.service';

describe('ErrorTrackingService', () => {
  let service: ErrorTrackingService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorTrackingService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for a new error', () => {
    expect(service.isRecentlyShown('/api/test', 500)).toBe(false);
  });

  it('should return true for duplicate error within dedup window', () => {
    service.isRecentlyShown('/api/test', 500);
    expect(service.isRecentlyShown('/api/test', 500)).toBe(true);
  });

  it('should return false for different URL', () => {
    service.isRecentlyShown('/api/test', 500);
    expect(service.isRecentlyShown('/api/other', 500)).toBe(false);
  });

  it('should return false for different status code', () => {
    service.isRecentlyShown('/api/test', 500);
    expect(service.isRecentlyShown('/api/test', 404)).toBe(false);
  });

  it('should allow same error after dedup window expires', () => {
    service.isRecentlyShown('/api/test', 500);

    vi.advanceTimersByTime(5001);

    expect(service.isRecentlyShown('/api/test', 500)).toBe(false);
  });

  it('should clean up tracked errors after cleanup delay', () => {
    service.isRecentlyShown('/api/test', 500);

    vi.advanceTimersByTime(10001);

    // After cleanup, error should no longer be tracked
    expect(service.isRecentlyShown('/api/test', 500)).toBe(false);
  });

  it('should clear all tracked errors', () => {
    service.isRecentlyShown('/api/test', 500);
    service.isRecentlyShown('/api/other', 404);

    service.clear();

    expect(service.isRecentlyShown('/api/test', 500)).toBe(false);
    expect(service.isRecentlyShown('/api/other', 404)).toBe(false);
  });
});
