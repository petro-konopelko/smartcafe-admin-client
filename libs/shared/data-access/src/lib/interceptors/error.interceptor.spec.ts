import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockSnackBar = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should pass through successful requests', () => {
    const testData = { id: '1', name: 'Test' };

    httpClient.get('/api/test').subscribe((data) => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(testData);
  });

  it('should show snackbar on 400 error', () => {
    httpClient.get('/api/test-400').subscribe({
      error: () => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Invalid request. Please check your input.',
          'Close',
          expect.objectContaining({ duration: 5000 })
        );
      }
    });

    const req = httpMock.expectOne('/api/test-400');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should show snackbar on 404 error', () => {
    httpClient.get('/api/test-404').subscribe({
      error: () => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Resource not found.',
          'Close',
          expect.objectContaining({ duration: 5000 })
        );
      }
    });

    const req = httpMock.expectOne('/api/test-404');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should show snackbar on 409 conflict error', () => {
    httpClient.get('/api/test-409').subscribe({
      error: () => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Conflict with existing data.',
          'Close',
          expect.objectContaining({ duration: 5000 })
        );
      }
    });

    const req = httpMock.expectOne('/api/test-409');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });
  });

  it('should show snackbar on 500 server error', () => {
    httpClient.get('/api/test-500').subscribe({
      error: () => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Server error. Please try again later.',
          'Close',
          expect.objectContaining({ duration: 5000 })
        );
      }
    });

    const req = httpMock.expectOne('/api/test-500');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should show network error snackbar on status 0', () => {
    httpClient.get('/api/test-network').subscribe({
      error: () => {
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Network error. Please check your connection.',
          'Close',
          expect.objectContaining({ duration: 5000 })
        );
      }
    });

    const req = httpMock.expectOne('/api/test-network');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('should re-throw the error after showing snackbar', () => {
    const errorSpy = vi.fn();

    httpClient.get('/api/test-rethrow').subscribe({
      error: (err) => {
        errorSpy(err);
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/test-rethrow');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

    expect(errorSpy).toHaveBeenCalled();
  });

  it('should display snackbar with correct positioning options', () => {
    httpClient.get('/api/test-position').subscribe({
      error: () => {
        /* expected */
      }
    });

    const req = httpMock.expectOne('/api/test-position');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      expect.any(String),
      'Close',
      expect.objectContaining({
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      })
    );
  });
});
