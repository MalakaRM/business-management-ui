import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          console.error('Unauthorized request:', error);

          localStorage.removeItem('access_token');
          localStorage.removeItem('username');
          localStorage.removeItem('roles');
          localStorage.removeItem('permissions');
          localStorage.removeItem('password_change_required');

          router.navigate(['/login']);
          break;

        case 403:
          console.error('Access forbidden:', error);

          router.navigate(['/404']);
          break;

        case 404:
          console.error('Resource not found:', error);
          break;

        case 500:
          console.error('Internal server error:', error);
          break;

        default:
          console.error('HTTP error:', error);
      }

      return throwError(() => error);
    }),
  );
};
