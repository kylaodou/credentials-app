import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../../../shared/components/auth-layout/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-verify',
  imports: [RouterLink, AuthLayoutComponent],
  template: `
    <app-auth-layout
      heading="Vérification en deux étapes"
      subheading="Saisissez le code à 4 chiffres envoyé à votre adresse email.">

      <h1 class="font-display text-4xl mb-1" style="color:#0F172A;">Code OTP</h1>
      <p class="text-sm mb-2" style="color:#64748B;">
        Code envoyé à <strong style="color:#2563EB;">{{ email }}</strong>
      </p>

      <!-- Countdown -->
      <div class="flex items-center gap-2 mb-6 px-3 py-2 rounded" style="background:#F8FAFF; border:1px solid #E2E8F0;">
        <i class="fa-regular fa-clock" [style.color]="timeLeft <= 60 ? '#DC2626' : '#2563EB'"></i>
        @if (timeLeft > 0) {
          <span class="text-sm font-semibold" [style.color]="timeLeft <= 60 ? '#DC2626' : '#0F172A'">
            Code valide encore {{ formatTime(timeLeft) }}
          </span>
        } @else {
          <span class="text-sm font-semibold" style="color:#DC2626;">Code expiré</span>
        }
      </div>

      <!-- 4 inputs OTP -->
      <div class="flex gap-3 justify-center mb-5">
        @for (i of [0,1,2,3]; track i) {
          <input type="text" inputmode="numeric" maxlength="1"
            [id]="'otp-' + i"
            (input)="onInput($event, i)"
            (keydown)="onKeydown($event, i)"
            class="text-center text-2xl font-bold bg-white transition"
            style="width:56px; height:56px; border:1px solid #E2E8F0; border-radius:5px; outline:none; font-family:inherit;"
            onfocus="this.style.borderColor='#2563EB'"
            onblur="this.style.borderColor='#E2E8F0'" />
        }
      </div>

      @if (error) {
        <div class="mb-4 p-3 flex items-center gap-2 text-sm"
          style="background:#FEF2F2; border:1px solid #FECACA; color:#DC2626; border-radius:5px;">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </div>
      }

      <button (click)="verify()" [disabled]="code.length < 4 || loading || timeLeft === 0"
        class="btn-primary w-full disabled:opacity-50">
        @if (loading) { <i class="fa-solid fa-spinner fa-spin mr-2"></i> }
        <i class="fa-solid fa-check mr-2"></i> Vérifier le code
      </button>

      <div class="text-center mt-5 pt-5 flex items-center justify-center gap-4" style="border-top:1px solid #E2E8F0;">
        <a [routerLink]="['/forgot-password']" class="text-sm font-semibold" style="color:#2563EB; text-decoration:none;">
          <i class="fa-solid fa-rotate-right mr-1"></i> Renvoyer un code
        </a>
        <span style="color:#E2E8F0;">|</span>
        <a [routerLink]="['/login']" class="text-sm" style="color:#64748B; text-decoration:none;">
          <i class="fa-solid fa-arrow-left mr-1"></i> Retour
        </a>
      </div>
    </app-auth-layout>
  `,
})
export class OtpVerifyComponent implements OnInit, OnDestroy {
  private route  = inject(ActivatedRoute);
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = '';
  code     = '';
  loading  = false;
  error    = '';
  timeLeft = 300; // 5 minutes
  private timer: any;

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.startCountdown();
  }

  ngOnDestroy() { clearInterval(this.timer); }

  startCountdown() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) this.timeLeft--;
      else clearInterval(this.timer);
    }, 1000);
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 1);
    this.code = Array.from({ length: 4 }, (_, i) =>
      (document.getElementById(`otp-${i}`) as HTMLInputElement)?.value ?? '').join('');
    if (input.value && index < 3)
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0)
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
  }

  verify() {
    if (this.timeLeft === 0) { this.error = 'Le code a expiré. Veuillez en demander un nouveau.'; return; }
    this.loading = true; this.error = '';
    this.auth.verifyOtp(this.email, this.code).subscribe({
      next: () => this.router.navigate(['/reset-password'], { queryParams: { email: this.email } }),
      error: () => { this.error = 'Code invalide ou expiré'; this.loading = false; },
    });
  }
}

