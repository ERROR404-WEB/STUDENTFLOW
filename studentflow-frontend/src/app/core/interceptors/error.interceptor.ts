import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errMsg = 'An unexpected error occurred. Please try again.';

      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        localStorage.clear();
        router.navigate(['/login']);
        errMsg = 'Your session has expired. Please log in again.';
      } else if (error.error) {
        if (typeof error.error === 'string') {
          errMsg = error.error;
        } else if (error.error.message) {
          errMsg = error.error.message;
        }
      } else if (error.message) {
        errMsg = error.message;
      }

      console.error('HTTP Error caught by Interceptor:', error);

      // Display via PrimeNG MessageService toaster
      messageService.add({
        severity: 'error',
        summary: `Error (Status ${error.status || 'unknown'})`,
        detail: errMsg,
        life: 5000
      });

      // Also trigger a browser alert fallback for critical issues
      if (error.status === 0) {
        alert('Server connection failed. Please ensure the backend is running.');
      } else if (error.status >= 500) {
        alert(`Server Error (${error.status}): ${errMsg}`);
      }

      return throwError(() => error);
    })
  );
};
