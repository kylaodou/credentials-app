import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  user = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));

  // La redirection Google se fait directement via window.location dans le composant
  // Le backend gère le redirect OAuth

  setPassword(password: string, password_confirmation: string) {
    return this.api.post('auth/set-password', { password, password_confirmation });
  }

  verifyAppPassword(password: string) {
    return this.api.post<{ verified: boolean }>('auth/verify-password', { password });
  }

  sendOtp(email: string) {
    return this.api.post('auth/forgot-password/send-otp', { email });
  }

  verifyOtp(email: string, code: string) {
    return this.api.post('auth/forgot-password/verify-otp', { email, code });
  }

  resetPassword(email: string, password: string, password_confirmation: string) {
    return this.api.post('auth/forgot-password/reset', { email, password, password_confirmation });
  }

  loadMe() {
    return this.api.get<User>('me').pipe(tap((u: User) => this.user.set(u)));
  }

  logout() {
    this.api.post('logout', {}).subscribe();
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}
