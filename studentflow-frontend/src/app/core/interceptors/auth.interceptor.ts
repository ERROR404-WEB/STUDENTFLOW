import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || localStorage.getItem('userID');

  // Skip adding the token for login and signup endpoints
  const isAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/agent-signup');

  if (token && !isAuthRequest) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    // Send userID in query instead of headers
    let newParams = req.params;
    if (userId && !newParams.has('userID')) {
      newParams = newParams.set('userID', userId);
    }

    const cloned = req.clone({
      setHeaders: headers,
      params: newParams
    });
    return next(cloned);
  }

  return next(req);
};
