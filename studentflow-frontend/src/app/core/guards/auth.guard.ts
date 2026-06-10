import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard to prevent unauthenticated users from accessing protected routes.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token && token !== 'null' && token !== 'undefined') {
    return true;
  }

  // Redirect to login page if not authenticated
  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && token !== 'null' && token !== 'undefined') {
    if (role === 'AGENT') {
      router.navigate(['/applications']);
    } else if (role === 'ADMIN') {
      router.navigate(['/admin-dashboard']);
    } else {
      router.navigate(['/internal-dashboard']);
    }
    return false;
  }

  return true;
};
