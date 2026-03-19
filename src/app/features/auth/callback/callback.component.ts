import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';
import { tap } from 'rxjs';

@Component({
  selector: 'app-callback',
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center" style="background:#F8FAFF;">
      <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:40px; text-align:center; min-width:280px;">
        @if (error) {
          <i class="fa-solid fa-circle-exclamation text-3xl mb-3 block" style="color:#DC2626;"></i>
          <p class="font-semibold mb-4" style="color:#0F172A;">{{ error }}</p>
          <a href="/login" class="btn-primary">Retour à la connexion</a>
        } @else {
          <i class="fa-solid fa-spinner fa-spin text-2xl mb-3 block" style="color:#2563EB;"></i>
          <p class="text-sm" style="color:#64748B;">Connexion en cours...</p>
        }
      </div>
    </div>
  `,
})
export class CallbackComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private auth   = inject(AuthService);
  private api    = inject(ApiService);
  private router = inject(Router);

  error = '';

  ngOnInit() {
    const params      = this.route.snapshot.queryParamMap;
    const token       = params.get('token');
    const needsPassword = params.get('needs_password') === 'true';
    const errorParam  = params.get('error');

    if (errorParam) { this.error = 'La connexion Google a échoué. Veuillez réessayer.'; return; }
    if (!token)     { this.error = 'Token manquant. Veuillez réessayer.'; return; }

    this.auth.token.set(token);
    localStorage.setItem('token', token);

    this.api.get<User>('me').pipe(tap((u) => this.auth.user.set(u))).subscribe({
      next: () => {
        if (needsPassword) {
          // Première connexion → définir mot de passe
          this.router.navigate(['/set-password']);
        } else {
          // Connexion suivante → toujours demander le mot de passe
          this.router.navigate(['/verify-password']);
        }
      },
      error: () => { this.error = 'Impossible de charger le profil.'; },
    });
  }
}

