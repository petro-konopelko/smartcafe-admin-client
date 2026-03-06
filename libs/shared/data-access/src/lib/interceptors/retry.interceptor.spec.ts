import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should pass through successful requests without retrying', () => {
    const testData = { id: '1' };

    httpClient.get('/api/test').subscribe((data) => {
      expect(data).toEqual(testData);
    });

    httpMock.expectOne('/api/test').flush(testData);
  });

  it('should not retry on 400 client errors', () => {
    const errorSpy = vi.fn();

    httpClient.get('/api/test').subscribe({ error: errorSpy });

    httpMock
      .expectOne('/api/test')
      .flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    expect(errorSpy).toHaveBeenCalled();
    httpMock.verify(); // No additional requests
  });

  it('should not retry on 404 errors', () => {
    const errorSpy = vi.fn();

    httpClient.get('/api/test').subscribe({ error: errorSpy });

    httpMock.expectOne('/api/test').flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(errorSpy).toHaveBeenCalled();
    httpMock.verify();
  });

  it('should skip i18n translation file requests entirely', () => {
    const testData = { key: 'value' };

    httpClient.get('/assets/i18n/en-US.json').subscribe((data) => {
      expect(data).toEqual(testData);
    });

    httpMock.expectOne('/assets/i18n/en-US.json').flush(testData);
  });

  it('should not retry i18n requests on failure', () => {
    const errorSpy = vi.fn();

    httpClient.get('/assets/i18n/uk-UA.json').subscribe({ error: errorSpy });

    httpMock
      .expectOne('/assets/i18n/uk-UA.json')
      .flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorSpy).toHaveBeenCalled();
    httpMock.verify(); // No retries
  });
});
