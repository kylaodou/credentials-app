import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models';
import { ApiService } from './api.service';
import { MiniSessionService } from './mini-session.service';
import { ToastService } from './toast.service';

const TOKEN_KEY = 'token';
const LOCKED_KEY = 'session_locked';

/** Réponse du serveur après la saisie du mot de passe applicatif. */
export interface UnlockResponse {
  verified?: boolean;
  token?: string;      // présent quand un jeton limité est remplacé par un jeton de session
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private miniSession = inject(MiniSessionService);
  private toast = inject(ToastService);

  user = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  /** Vrai tant que le mot de passe applicatif n'a pas été saisi (jeton limité délivré après Google). */
  locked = signal<boolean>(localStorage.getItem(LOCKED_KEY) === '1');

  /** Jeton reçu après Google : il ne donne accès qu'au profil et à la saisie du mot de passe. */
  setPendingToken(token: string) {
    this.storeToken(token, true);
  }

  setPassword(password: string, password_confirmation: string) {
    return this.api.post<UnlockResponse>('auth/set-password', { password, password_confirmation })
      .pipe(tap((r) => this.unlocked(r)));
  }

  verifyAppPassword(password: string) {
    return this.api.post<UnlockResponse>('auth/verify-password', { password })
      .pipe(tap((r) => this.unlocked(r)));
  }

  sendOtp(email: string) {
    return this.api.post('auth/forgot-password/send-otp', { email });
  }

  verifyOtp(email: string, code: string) {
    return this.api.post<{ message: string; reset_token: string }>('auth/forgot-password/verify-otp', { email, code });
  }

  resetPassword(email: string, reset_token: string, password: string, password_confirmation: string) {
    return this.api.post('auth/forgot-password/reset', { email, reset_token, password, password_confirmation });
  }

  loadMe() {
    return this.api.get<User>('me').pipe(tap((u: User) => this.user.set(u)));
  }

  /** Déconnexion volontaire : le jeton est aussi supprimé côté serveur. */
  logout(message?: string) {
    if (this.token()) this.api.post('logout', {}).subscribe({ error: () => {} });
    this.clearSession(message);
  }

  /** Session déjà fermée côté serveur (inactivité, expiration) : nettoyage local seulement. */
  clearSession(message?: string) {
    const hadSession = !!this.token();
    this.token.set(null);
    this.user.set(null);
    this.locked.set(false);
    this.miniSession.clear();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LOCKED_KEY);
    if (hadSession && message) this.toast.show(message, 'warning', 6000);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  /** Connectée et mot de passe applicatif saisi. */
  isUnlocked(): boolean {
    return this.isLoggedIn() && !this.locked();
  }

  private unlocked(r: UnlockResponse) {
    if (r.token) this.storeToken(r.token, false);
    this.miniSession.grant(r.expires_in);
  }

  private storeToken(token: string, locked: boolean) {
    this.token.set(token);
    this.locked.set(locked);
    localStorage.setItem(TOKEN_KEY, token);
    if (locked) localStorage.setItem(LOCKED_KEY, '1');
    else localStorage.removeItem(LOCKED_KEY);
  }
}
