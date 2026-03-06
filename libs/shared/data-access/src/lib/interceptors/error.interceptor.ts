import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProblemDetails, HttpValidationProblemDetails } from '@smartcafe/admin/shared/models';
import { ErrorTrackingService } from '../services/error-tracking.service';

const SNACKBAR_DURATION_MS = 5000;

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null && 'status' in value && 'title' in value;
}

function isValidationProblemDetails(value: unknown): value is HttpValidationProblemDetails {
  return isProblemDetails(value) && 'errors' in value;
}

function extractValidationMessages(problem: HttpValidationProblemDetails): string {
  const messages = Object.values(problem.errors).flat();
  return messages.length > 0 ? messages.join('; ') : (problem.detail ?? 'Validation failed.');
}

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error instanceof ErrorEvent) {
    return error.error.message;
  }

  const body = error.error;

  // Parse ProblemDetails from backend
  if (isValidationProblemDetails(body)) {
    return extractValidationMessages(body);
  }

  if (isProblemDetails(body) && body.detail) {
    return body.detail;
  }

  // Fallback by status code
  switch (error.status) {
    case 0:
      return 'Network error. Please check your connection.';
    case 400:
      return 'Invalid request. Please check your input.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict with existing data.';
    default:
      if (error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return body?.detail || error.message || 'An error occurred';
  }
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const errorTracking = inject(ErrorTrackingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!errorTracking.isRecentlyShown(req.url, error.status)) {
        const errorMessage = getErrorMessage(error);

        snackBar.open(errorMessage, 'Close', {
          duration: SNACKBAR_DURATION_MS,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => error);
    })
  );
};
