import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  it('should call loadingService.show() when request starts', () => {
    const showSpy = vi.spyOn(loadingService, 'show');

    httpClient.get('/api/test').subscribe();

    expect(showSpy).toHaveBeenCalled();

    httpMock.expectOne('/api/test').flush({});
  });

  it('should call loadingService.hide() when request completes successfully', () => {
    const hideSpy = vi.spyOn(loadingService, 'hide');

    httpClient.get('/api/test').subscribe();

    expect(hideSpy).not.toHaveBeenCalled();

    httpMock.expectOne('/api/test').flush({});

    expect(hideSpy).toHaveBeenCalled();
  });

  it('should call loadingService.hide() when request fails', () => {
    const hideSpy = vi.spyOn(loadingService, 'hide');

    httpClient.get('/api/test').subscribe({
      error: () => {
        /* expected */
      }
    });

    httpMock.expectOne('/api/test').flush('Error', { status: 500, statusText: 'Server Error' });

    expect(hideSpy).toHaveBeenCalled();
  });

  it('should show then hide for a complete request lifecycle', () => {
    const callOrder: string[] = [];
    vi.spyOn(loadingService, 'show').mockImplementation(() => callOrder.push('show'));
    vi.spyOn(loadingService, 'hide').mockImplementation(() => callOrder.push('hide'));

    httpClient.get('/api/test').subscribe();

    expect(callOrder).toEqual(['show']);

    httpMock.expectOne('/api/test').flush({ data: 'ok' });

    expect(callOrder).toEqual(['show', 'hide']);
  });

  it('should handle concurrent requests correctly', () => {
    const showSpy = vi.spyOn(loadingService, 'show');
    const hideSpy = vi.spyOn(loadingService, 'hide');

    httpClient.get('/api/first').subscribe();
    httpClient.get('/api/second').subscribe();

    expect(showSpy).toHaveBeenCalledTimes(2);

    httpMock.expectOne('/api/first').flush({});
    expect(hideSpy).toHaveBeenCalledTimes(1);

    httpMock.expectOne('/api/second').flush({});
    expect(hideSpy).toHaveBeenCalledTimes(2);
  });
});
