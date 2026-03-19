import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-password',
  imports: [FormsModule, AuthLayoutComponent],
  template: `
    <app-auth-layout
      heading="Vérification d'identité"
      subheading="Entrez votre mot de passe pour accéder à vos credentials.">

      <h1 class="font-display text-4xl mb-1" style="color:#0F172A;">Bienvenue</h1>
      <p class="text-sm mb-8" style="color:#64748B;">
        Connecté en tant que <strong style="color:#0F172A;">{{ auth.user()?.name }}</strong>
      </p>

      <div class="mb-4">
        <label class="block text-xs font-semibold mb-1.5" style="color:#374151;">
          <i class="fa-solid fa-lock mr-1" style="color:#2563EB;"></i> Mot de passe
        </label>
        <div class="relative">
          <input [type]="showPw() ? 'text' : 'password'" [(ngModel)]="password"
            class="input pr-9" placeholder="Votre mot de passe"
            (keydown.enter)="verify()" />
          <button type="button" (click)="showPw.set(!showPw())"
            style="position:absolute; right:9px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94A3B8; cursor:pointer;">
            <i [class]="showPw() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:13px;"></i>
          </button>
        </div>
      </div>

      @if (error) {
        <div class="mb-4 p-3 rounded flex items-center gap-2 text-sm"
          style="background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; border-radius:5px;">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </div>
      }

      <button (click)="verify()" [disabled]="!password || loading()" class="btn-primary w-full disabled:opacity-50">
        @if (loading()) { <i class="fa-solid fa-spinner fa-spin mr-2"></i> }
        <i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> Accéder à mes credentials
      </button>

      <div class="mt-5 pt-5 text-center" style="border-top:1px solid #E2E8F0;">
        <button (click)="logout()" class="text-xs" style="color:#94A3B8; background:none; border:none; cursor:pointer;">
          <i class="fa-solid fa-right-from-bracket mr-1"></i> Se connecter avec un autre compte
        </button>
      </div>
    </app-auth-layout>
  `,
})
export class VerifyPasswordComponent {
  auth    = inject(AuthService);
  private router = inject(Router);

  password = '';
  showPw   = signal(false);
  loading  = signal(false);
  error    = '';

  verify() {
    if (!this.password) return;
    this.loading.set(true);
    this.error = '';
    this.auth.verifyAppPassword(this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => { this.error = 'Mot de passe incorrect'; this.loading.set(false); },
    });
  }

  logout() {
    this.auth.logout();
  }
}

