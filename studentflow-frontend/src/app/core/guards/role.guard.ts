import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard to restrict access to routes based on user roles.
 * Pass expected roles in the route definition under 'data.roles':
 * e.g., data: { roles: ['ADMIN', 'QA_OFFICER'] }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    router.navigate(['/']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as Array<string>;

  if (expectedRoles && expectedRoles.length > 0 && !expectedRoles.includes(userRole || '')) {
    console.warn(`Access denied for role ${userRole}. Expected one of:`, expectedRoles);
    
    // Redirect based on the user's role to prevent dead ends
    if (userRole === 'AGENT') {
      router.navigate(['/applications']);
    } else {
      router.navigate(['/internal-dashboard']);
    }
    return false;
  }

  return true;
};
