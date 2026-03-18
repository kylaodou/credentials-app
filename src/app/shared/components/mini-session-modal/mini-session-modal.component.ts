import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MiniSessionService } from '../../../core/services/mini-session.service';

@Component({
  selector: 'app-mini-session-modal',
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.45);"
      (click)="cancel.emit()">
      <div style="background:#fff; border-radius:8px; width:100%; max-width:360px; padding:24px;"
        (click)="$event.stopPropagation()">

        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center rounded-full"
            style="width:36px; height:36px; background:#EFF6FF; flex-shrink:0;">
            <i class="fa-solid fa-lock" style="color:#2563EB; font-size:14px;"></i>
          </div>
          <div>
            <p class="font-bold text-sm" style="color:#0F172A;">Vérification requise</p>
            <p class="text-xs" style="color:#94A3B8;">Entrez votre mot de passe pour continuer</p>
          </div>
        </div>

        <div class="relative mb-3">
          <input [type]="showPw() ? 'text' : 'password'" [(ngModel)]="password"
            class="input pr-9" placeholder="Mot de passe applicatif"
            (keydown.enter)="submit()" />
          <button type="button" (click)="showPw.set(!showPw())"
            style="position:absolute; right:9px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94A3B8; cursor:pointer;">
            <i [class]="showPw() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:13px;"></i>
          </button>
        </div>

        @if (error()) {
          <p class="text-xs mb-3" style="color:#DC2626;">
            <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ error() }}
          </p>
        }

        <div class="flex gap-2">
          <button (click)="cancel.emit()" class="btn-outline flex-1" style="font-size:13px;">Annuler</button>
          <button (click)="submit()" [disabled]="!password || loading()" class="btn-primary flex-1 disabled:opacity-50" style="font-size:13px;">
            @if (loading()) { <i class="fa-solid fa-spinner fa-spin mr-1.5"></i> }
            Confirmer
          </button>
        </div>

        <p class="text-xs text-center mt-3" style="color:#CBD5E1;">
          <i class="fa-regular fa-clock mr-1"></i> Session valide 5 minutes
        </p>
      </div>
    </div>
  `,
})
export class MiniSessionModalComponent {
  // Injections en premier
  private authService    = inject(AuthService);
  private miniSessionSvc = inject(MiniSessionService);

  @Output() verified = new EventEmitter<void>();
  @Output() cancel   = new EventEmitter<void>();

  password = '';
  showPw   = signal(false);
  loading  = signal(false);
  error    = signal('');

  submit() {
    if (!this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.authService.verifyAppPassword(this.password).subscribe({
      next: () => {
        this.miniSessionSvc.grant();
        this.loading.set(false);
        this.verified.emit();
      },
      error: () => {
        this.error.set('Mot de passe incorrect');
        this.loading.set(false);
      },
    });
  }
}
