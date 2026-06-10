import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader.service';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Start loader
  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      // Stop loader when finished (success or error)
      loaderService.hide();
    })
  );
};
