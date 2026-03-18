import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout
      heading="Mot de passe oublié ?"
      subheading="Entrez votre email et nous vous enverrons un code OTP à 4 chiffres.">

      <h1 class="font-display text-4xl mb-1" style="color:#0F172A;">Réinitialisation du mot de passe</h1>
      <p class="text-sm mb-8" style="color:#64748B;">Un code à 4 chiffres sera envoyé à votre email</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-5">
          <label class="block text-sm font-semibold mb-1.5" style="color:#0F172A;">
            <i class="fa-solid fa-at mr-1" style="color:#2563EB;"></i> Adresse email
          </label>
          <input type="email" formControlName="email" class="input" placeholder="votre@email.com" />
        </div>
        @if (error) {
          <div class="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
            style="background:#FEF2F2; border:1px solid #FECACA; color:#DC2626;">
            <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
          </div>
        }
        <button type="submit" [disabled]="form.invalid || loading" class="btn-primary w-full disabled:opacity-60">
          @if (loading) { <i class="fa-solid fa-spinner fa-spin mr-2"></i> Envoi... }
          @else { <i class="fa-solid fa-paper-plane mr-2"></i> Envoyer le code OTP }
        </button>
      </form>

      <div class="text-center mt-6 pt-6" style="border-top:1px solid #E2E8F0;">
        <a [routerLink]="['/login']" class="inline-flex items-center gap-2 text-sm font-semibold" style="color:#2563EB;">
          <i class="fa-solid fa-arrow-left"></i> Retour à la connexion
        </a>
      </div>
    </app-auth-layout>
  `,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  error = '';
  submit() {
    this.loading = true; this.error = '';
    this.auth.sendOtp(this.form.value.email!).subscribe({
      next: () => this.router.navigate(['/otp-verify'], { queryParams: { email: this.form.value.email } }),
      error: () => { this.error = 'Email introuvable ou erreur serveur'; this.loading = false; },
    });
  }
}

