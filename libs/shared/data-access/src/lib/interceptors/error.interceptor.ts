import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

// Context token to track if error has been shown
export const ERROR_SHOWN = new HttpContextToken<boolean>(() => false);

const shownErrors = new Set<string>();

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Create a unique key for this error to prevent duplicates
      const errorKey = `${req.url}-${error.status}-${Date.now()}`;
      const baseErrorKey = `${req.url}-${error.status}`;

      // Check if we've already shown this error recently (within last 5 seconds)
      const recentlyShown = Array.from(shownErrors).some(
        (key) =>
          key.startsWith(baseErrorKey) && Date.now() - parseInt(key.split('-').pop() || '0') < 5000,
      );

      if (!recentlyShown) {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          if (error.status === 400) {
            errorMessage = 'Invalid request. Please check your input.';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error.status === 409) {
            errorMessage = 'Conflict with existing data.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          } else {
            errorMessage = error.error?.detail || error.message || 'Unknown error';
          }
        }

        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });

        // Track this error
        shownErrors.add(errorKey);

        // Clean up old entries after 10 seconds
        setTimeout(() => shownErrors.delete(errorKey), 10000);
      }

      return throwError(() => error);
    }),
  );
};
