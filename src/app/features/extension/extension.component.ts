import { Component, OnDestroy, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { MiniSessionService } from '../../core/services/mini-session.service';
import { ToastService } from '../../core/services/toast.service';
import { MiniSessionModalComponent } from '../../shared/components/mini-session-modal/mini-session-modal.component';

/** Lien de téléchargement de l'extension (archive à installer dans Chrome, Edge ou Brave). */
export const EXTENSION_DOWNLOAD_URL = 'https://github.com/kylaodou/credentials-app-extension/releases/latest';

@Component({
  selector: 'app-extension',
  imports: [MiniSessionModalComponent],
  template: `
    <div class="max-w-2xl">
      <h2 class="font-display text-2xl font-bold mb-2" style="color:#0F172A;">Extension de navigateur</h2>
      <p class="text-sm mb-6" style="color:#64748B;">
        L'extension propose d'enregistrer vos identifiants quand vous vous connectez à un site,
        et remplit le formulaire de connexion quand vous revenez.
      </p>

      <div class="space-y-4">
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:20px;">
          <p class="font-semibold mb-1" style="color:#0F172A;">1. Installer l'extension</p>
          <p class="text-sm mb-3" style="color:#64748B;">Chrome, Edge ou Brave sur ordinateur.</p>
          <a [href]="downloadUrl" target="_blank" rel="noopener" class="btn-primary inline-flex items-center gap-2">
            <i class="fa-solid fa-download"></i> Télécharger l'extension
          </a>
        </div>

        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:20px;">
          <p class="font-semibold mb-1" style="color:#0F172A;">2. Générer un code de connexion</p>
          <p class="text-sm mb-3" style="color:#64748B;">
            Le code sert une seule fois et expire après 5 minutes. Votre mot de passe applicatif vous sera demandé.
          </p>

          @if (code()) {
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-2xl font-bold tracking-widest px-4 py-2"
                style="background:#EFF6FF; color:#1D4ED8; border-radius:6px; letter-spacing:0.25em;">{{ code() }}</span>
              <button class="btn-outline" (click)="copy()"><i class="fa-regular fa-copy"></i> Copier</button>
              <span class="text-sm" style="color:#64748B;">expire dans {{ remaining() }}</span>
            </div>
          } @else {
            <button class="btn-primary" [disabled]="loading()" (click)="generate()">
              @if (loading()) { <i class="fa-solid fa-spinner fa-spin"></i> } @else { <i class="fa-solid fa-link"></i> }
              Générer un code
            </button>
          }
        </div>

        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:20px;">
          <p class="font-semibold mb-1" style="color:#0F172A;">3. Saisir le code dans l'extension</p>
          <p class="text-sm" style="color:#64748B;">
            Cliquez sur l'icône de l'extension, collez le code, puis déverrouillez-la avec votre mot de passe applicatif.
            Elle se reverrouille seule après 15 minutes.
          </p>
        </div>

        <p class="text-xs" style="color:#94A3B8;">
          <i class="fa-solid fa-shield-halved"></i>
          Une seule extension peut être connectée à la fois : générer un nouveau code déconnecte la précédente.
          Changer votre mot de passe applicatif la déconnecte aussi.
        </p>
      </div>
    </div>

    @if (showMiniSession()) {
      <app-mini-session-modal (verified)="onVerified()" (cancel)="showMiniSession.set(false)" />
    }
  `,
})
export class ExtensionComponent implements OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private miniSession = inject(MiniSessionService);

  downloadUrl = EXTENSION_DOWNLOAD_URL;
  code = signal('');
  loading = signal(false);
  showMiniSession = signal(false);
  private expiresAt = 0;
  private now = signal(Date.now());
  private ticker = setInterval(() => {
    this.now.set(Date.now());
    if (this.code() && this.now() >= this.expiresAt) this.code.set('');
  }, 1000);

  remaining() {
    const s = Math.max(0, Math.round((this.expiresAt - this.now()) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  generate() {
    if (!this.miniSession.isValid()) { this.showMiniSession.set(true); return; }
    this.loading.set(true);
    this.api.post<{ code: string; expires_in: number }>('extension/code', {}).subscribe({
      next: (r) => {
        this.code.set(r.code);
        this.expiresAt = Date.now() + r.expires_in * 1000;
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 423) { this.miniSession.clear(); this.showMiniSession.set(true); }
        else this.toast.error('Impossible de générer le code.');
      },
    });
  }

  onVerified() {
    this.showMiniSession.set(false);
    this.generate();
  }

  copy() {
    navigator.clipboard.writeText(this.code());
    this.toast.success('Code copié.');
  }

  ngOnDestroy() {
    clearInterval(this.ticker);
  }
}
