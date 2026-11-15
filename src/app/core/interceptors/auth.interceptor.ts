import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  // Le jeton n'est envoyé qu'à notre API, jamais à un autre domaine.
  const toApi = req.url.startsWith(environment.apiUrl);
  if (token && toApi) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (toApi && token) {
        // Session fermée par le serveur (30 minutes d'inactivité, expiration, mot de passe changé).
        if (err.status === 401 && !req.url.endsWith('/auth/verify-password')) {
          auth.clearSession('Votre session a expiré. Reconnectez-vous.');
        }
        // Jeton limité : il faut d'abord saisir le mot de passe applicatif.
        if (err.status === 403 && auth.locked()) {
          router.navigate(['/verify-password']);
        }
      }
      return throwError(() => err);
    }),
  );
};
