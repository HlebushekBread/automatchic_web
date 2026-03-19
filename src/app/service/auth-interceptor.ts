import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtToken = localStorage.getItem('jwtToken');
  if (jwtToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
  }
  return next(req);
};
