import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [],
  template: `
    <div class="max-w-xl">
      <h2 class="font-display text-2xl font-bold mb-6" style="color:#0F172A;">Mon Profil</h2>

      <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:24px;">
        <div class="flex items-center gap-4 mb-6 pb-6" style="border-bottom:1px solid #F1F5F9;">
          @if (auth.user()?.avatar) {
            <img [src]="auth.user()!.avatar" class="w-16 h-16 rounded-full"
              style="border:2px solid #E2E8F0;" />
          } @else {
            <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style="background:#2563EB;">
              {{ auth.user()?.name?.[0]?.toUpperCase() }}
            </div>
          }
          <div>
            <p class="font-semibold text-lg" style="color:#0F172A;">{{ auth.user()?.name }}</p>
            <p class="text-sm" style="color:#64748B;">{{ auth.user()?.email }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color:#94A3B8;">Nom complet</p>
            <p class="text-sm font-medium" style="color:#0F172A;">{{ auth.user()?.name }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color:#94A3B8;">Adresse email</p>
            <p class="text-sm font-medium" style="color:#0F172A;">{{ auth.user()?.email }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color:#94A3B8;">Connexion via</p>
            <p class="text-sm font-medium flex items-center gap-2" style="color:#0F172A;">
              <i class="fa-brands fa-google" style="color:#4285F4;"></i> Google OAuth
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  auth = inject(AuthService);
}
