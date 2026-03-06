import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { setupMatchMediaMock } from '../../test-setup';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    setupMatchMediaMock();

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have currentTheme signal', () => {
    expect(service.currentTheme).toBeDefined();
  });

  it('should toggle theme', () => {
    const initial = service.currentTheme();
    service.toggleTheme();
    expect(service.currentTheme()).not.toBe(initial);
  });
});
