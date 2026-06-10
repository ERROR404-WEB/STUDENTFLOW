import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || token === 'null' || token === 'undefined') {
    router.navigate(['/login']);
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
