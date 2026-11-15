import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Pages des identifiants : connectée ET mot de passe applicatif saisi. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.locked()) return router.createUrlTree(['/verify-password']);
  return true;
};

/** Saisie ou création du mot de passe applicatif : il suffit d'être connectée avec Google. */
export const sessionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
