import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should show loading', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should hide loading', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});
