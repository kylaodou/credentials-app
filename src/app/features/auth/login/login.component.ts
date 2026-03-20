import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout
      heading="Bienvenue sur Credential App"
      subheading="Connectez-vous avec Google pour accéder à tous vos credentials en toute sécurité.">

      <h1 class="font-display text-4xl mb-1" style="color:#0F172A;">Connexion</h1>
      <p class="text-sm mb-8" style="color:#64748B;">Utilisez votre compte Google pour continuer</p>

      <!-- Bouton Google -->
      <button (click)="loginWithGoogle()" [disabled]="loading"
        class="w-full flex items-center justify-center gap-3 bg-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-60"
        style="border:2px solid #BFDBFE; color:#374151; box-shadow:0 2px 8px rgba(37,99,235,0.08);"
        onmouseover="this.style.borderColor='#2563EB'; this.style.boxShadow='0 4px 16px rgba(37,99,235,0.15)'"
        onmouseout="this.style.borderColor='#BFDBFE'; this.style.boxShadow='0 2px 8px rgba(37,99,235,0.08)'">
        @if (loading) {
          <i class="fa-solid fa-spinner fa-spin" style="color:#2563EB;"></i>
          <span>Redirection en cours...</span>
        } @else {
          <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continuer avec Google</span>
        }
      </button>

      @if (error) {
        <div class="mt-4 p-3 rounded-xl flex items-center gap-2 text-sm"
          style="background:#FEF2F2; border:1px solid #FECACA; color:#DC2626;">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </div>
      }

      <div class="flex items-center gap-4 my-7">
        <div class="flex-1 h-px" style="background:#E2E8F0;"></div>
        <span class="text-xs font-medium" style="color:#94A3B8;">ou</span>
        <div class="flex-1 h-px" style="background:#E2E8F0;"></div>
      </div>

      <div class="text-center">
        <p class="text-sm mb-3" style="color:#64748B;">Mot de passe oublié ?</p>
        <a [routerLink]="['/forgot-password']"
          class="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          style="color:#2563EB; border:1.5px solid #BFDBFE; background:transparent;"
          onmouseover="this.style.background='#EFF6FF'"
          onmouseout="this.style.background='transparent'">
          <i class="fa-solid fa-key"></i> Réinitialiser mon mot de passe
        </a>
      </div>

      <div class="mt-8 pt-6 grid grid-cols-2 gap-3" style="border-top:1px solid #E2E8F0;">
        <div class="flex items-center gap-2 text-xs" style="color:#64748B;">
          <i class="fa-solid fa-circle-check" style="color:#06B6D4;"></i> Chiffrement AES-256
        </div>
        <div class="flex items-center gap-2 text-xs" style="color:#64748B;">
          <i class="fa-solid fa-circle-check" style="color:#06B6D4;"></i> Auth Google sécurisée
        </div>
        <div class="flex items-center gap-2 text-xs" style="color:#64748B;">
          <i class="fa-solid fa-circle-check" style="color:#06B6D4;"></i> Mini-session protégée
        </div>
        <div class="flex items-center gap-2 text-xs" style="color:#64748B;">
          <i class="fa-solid fa-circle-check" style="color:#06B6D4;"></i> Tokens & passwords
        </div>
      </div>

    </app-auth-layout>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  loading = false;
  error = '';

  constructor() {
    // Remettre loading à false quand la page redevient visible (retour arrière)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.loading = false;
      }
    });
    window.addEventListener('pageshow', () => {
      this.loading = false;
    });
    window.addEventListener('focus', () => {
      this.loading = false;
    });
  }

  loginWithGoogle() {
    this.loading = true;
    this.error = '';
    window.location.href = 'https://credential-app-back.etw-express.com/api/auth/google/redirect';
  }
}

