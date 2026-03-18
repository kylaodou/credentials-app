import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { passwordMatch, passwordStrength } from '../../../core/validators/password.validators';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, AuthLayoutComponent],
  template: `
    <app-auth-layout
      heading="Nouveau mot de passe"
      subheading="Choisissez un mot de passe fort pour sécuriser l'accès à vos credentials.">

      <h1 class="font-display text-4xl mb-1" style="color:#0F172A;">Nouveau mot de passe</h1>
      <p class="text-sm mb-8" style="color:#64748B;">Minimum 8 caractères avec majuscule, chiffre et caractère spécial</p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="space-y-4 mb-2">

          <div>
            <label class="block text-sm font-semibold mb-1.5" style="color:#0F172A;">
              <i class="fa-solid fa-lock mr-1" style="color:#2563EB;"></i> Nouveau mot de passe
            </label>
            <div class="relative">
              <input [type]="showPw() ? 'text' : 'password'"
                formControlName="password" class="input pr-11" placeholder="Min. 8 caractères" />
              <button type="button" (click)="showPw.set(!showPw())"
                class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style="color:#94A3B8; background:none; border:none; padding:4px;">
                <i [class]="showPw() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            @if (pw.length > 0) {
              <div class="mt-2 grid grid-cols-2 gap-1">
                <div class="flex items-center gap-1.5 text-xs" [style.color]="!pwErrors['minLength'] ? '#16A34A' : '#94A3B8'">
                  <i [class]="!pwErrors['minLength'] ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
                  8 caractères min.
                </div>
                <div class="flex items-center gap-1.5 text-xs" [style.color]="!pwErrors['noUpper'] ? '#16A34A' : '#94A3B8'">
                  <i [class]="!pwErrors['noUpper'] ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
                  Une majuscule
                </div>
                <div class="flex items-center gap-1.5 text-xs" [style.color]="!pwErrors['noNumber'] ? '#16A34A' : '#94A3B8'">
                  <i [class]="!pwErrors['noNumber'] ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
                  Un chiffre
                </div>
                <div class="flex items-center gap-1.5 text-xs" [style.color]="!pwErrors['noSpecial'] ? '#16A34A' : '#94A3B8'">
                  <i [class]="!pwErrors['noSpecial'] ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'"></i>
                  Un spécial (@$!%*?&#38;#+)
                </div>
              </div>
            }
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1.5" style="color:#0F172A;">
              <i class="fa-solid fa-lock mr-1" style="color:#2563EB;"></i> Confirmer
            </label>
            <div class="relative">
              <input [type]="showConfirm() ? 'text' : 'password'"
                formControlName="password_confirmation" class="input pr-11" />
              <button type="button" (click)="showConfirm.set(!showConfirm())"
                class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style="color:#94A3B8; background:none; border:none; padding:4px;">
                <i [class]="showConfirm() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            @if (confirm.length > 0) {
              @if (form.hasError('mismatch')) {
                <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#DC2626;">
                  <i class="fa-solid fa-triangle-exclamation"></i> Les mots de passe ne correspondent pas
                </p>
              } @else {
                <p class="text-xs mt-1.5 flex items-center gap-1" style="color:#16A34A;">
                  <i class="fa-solid fa-circle-check"></i> Les mots de passe correspondent
                </p>
              }
            }
          </div>
        </div>

        @if (error) {
          <div class="my-4 p-3 rounded-xl flex items-center gap-2 text-sm"
            style="background:#FEF2F2; border:1px solid #FECACA; color:#DC2626;">
            <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
          </div>
        }

        <button type="submit" [disabled]="form.invalid || loading" class="btn-primary w-full mt-5 disabled:opacity-60">
          @if (loading) { <i class="fa-solid fa-spinner fa-spin mr-2"></i> Réinitialisation... }
          @else { <i class="fa-solid fa-check mr-2"></i> Réinitialiser le mot de passe }
        </button>
      </form>
    </app-auth-layout>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  showPw      = signal(false);
  showConfirm = signal(false);
  email   = '';
  loading = false;
  error   = '';

  form = this.fb.group({
    password:              ['', [Validators.required, passwordStrength()]],
    password_confirmation: ['', Validators.required],
  }, { validators: passwordMatch });

  ngOnInit() { this.email = this.route.snapshot.queryParamMap.get('email') ?? ''; }

  get pw()       { return this.form.get('password')?.value ?? ''; }
  get confirm()  { return this.form.get('password_confirmation')?.value ?? ''; }
  get pwErrors() { return this.form.get('password')?.errors ?? {}; }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const { password, password_confirmation } = this.form.value;
    this.auth.resetPassword(this.email, password!, password_confirmation!).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => { this.error = 'Erreur lors de la réinitialisation'; this.loading = false; },
    });
  }
}

