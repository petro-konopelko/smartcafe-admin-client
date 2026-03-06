import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorInterceptor } from './error.interceptor';
import { ErrorTrackingService } from '../services/error-tracking.service';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let errorTracking: ErrorTrackingService;

  beforeEach(() => {
    mockSnackBar = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: mockSnackBar },
        ErrorTrackingService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorTracking = TestBed.inject(ErrorTrackingService);
    errorTracking.clear();
  });

  it('should pass through successful requests', () => {
    const testData = { id: '1', name: 'Test' };

    httpClient.get('/api/test').subscribe((data) => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(testData);
  });

  it.each([
    {
      status: 400,
      statusText: 'Bad Request',
      body: 'Bad Request',
      expectedMessage: 'Invalid request. Please check your input.',
      description: '400 error without ProblemDetails'
    },
    {
      status: 404,
      statusText: 'Not Found',
      body: 'Not Found',
      expectedMessage: 'Resource not found.',
      description: '404 error'
    },
    {
      status: 409,
      statusText: 'Conflict',
      body: 'Conflict',
      expectedMessage: 'Conflict with existing data.',
      description: '409 conflict error'
    },
    {
      status: 500,
      statusText: 'Internal Server Error',
      body: 'Server Error',
      expectedMessage: 'Server error. Please try again later.',
      description: '500 server error'
    }
  ])(
    'should show "$expectedMessage" on $description',
    ({ status, statusText, body, expectedMessage }) => {
      const url = `/api/test-${status}-${Date.now()}`;

      httpClient.get(url).subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            expectedMessage,
            'Close',
            expect.objectContaining({ duration: 5000 })
          );
        }
      });

      const req = httpMock.expectOne(url);
      req.flush(body, { status, statusText });
    }
  );

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

  describe('ProblemDetails integration', () => {
    it('should extract detail from ProblemDetails response', () => {
      const problemDetails = {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Bad Request',
        status: 400,
        detail: 'Cafe name is required.',
        instance: '/api/cafes'
      };

      httpClient.get('/api/test-problem').subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Cafe name is required.',
            'Close',
            expect.objectContaining({ duration: 5000 })
          );
        }
      });

      const req = httpMock.expectOne('/api/test-problem');
      req.flush(problemDetails, { status: 400, statusText: 'Bad Request' });
    });

    it('should extract validation errors from HttpValidationProblemDetails', () => {
      const validationProblem = {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Validation Error',
        status: 400,
        detail: 'One or more validation errors occurred.',
        instance: '/api/cafes',
        errors: {
          Name: ['Name is required.', 'Name must be less than 200 characters.'],
          ContactInfo: ['Contact info is invalid.']
        }
      };

      httpClient.get('/api/test-validation').subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Name is required.; Name must be less than 200 characters.; Contact info is invalid.',
            'Close',
            expect.objectContaining({ duration: 5000 })
          );
        }
      });

      const req = httpMock.expectOne('/api/test-validation');
      req.flush(validationProblem, { status: 400, statusText: 'Bad Request' });
    });

    it('should fall back to detail when validation errors object is empty', () => {
      const validationProblem = {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Validation Error',
        status: 400,
        detail: 'Validation failed.',
        instance: '/api/cafes',
        errors: {}
      };

      httpClient.get('/api/test-empty-errors').subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Validation failed.',
            'Close',
            expect.objectContaining({ duration: 5000 })
          );
        }
      });

      const req = httpMock.expectOne('/api/test-empty-errors');
      req.flush(validationProblem, { status: 400, statusText: 'Bad Request' });
    });

    it('should fall back to status code message when ProblemDetails has no detail', () => {
      const problemDetails = {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
        title: 'Not Found',
        status: 404,
        detail: null,
        instance: '/api/cafes/nonexistent'
      };

      httpClient.get('/api/test-no-detail').subscribe({
        error: () => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Resource not found.',
            'Close',
            expect.objectContaining({ duration: 5000 })
          );
        }
      });

      const req = httpMock.expectOne('/api/test-no-detail');
      req.flush(problemDetails, { status: 404, statusText: 'Not Found' });
    });
  });
});
