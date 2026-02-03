import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't retry translation file requests
  if (req.url.includes('/i18n/')) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        if (error.status === 0 || error.status >= 500) {
          console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          return timer(RETRY_DELAY_MS * retryCount);
        }
        // Don't retry for other errors
        throw error;
      },
    }),
  );
};
