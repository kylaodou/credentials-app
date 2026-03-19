import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Credential, CredentialSecrets } from '../../../core/models';
import { CredentialService } from '../../../core/services/credential.service';
import { MiniSessionService } from '../../../core/services/mini-session.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal.component';
import { MiniSessionModalComponent } from '../../../shared/components/mini-session-modal/mini-session-modal.component';

type PendingAction = 'reveal' | 'edit' | 'delete' | null;

@Component({
  selector: 'app-credential-detail',
  imports: [RouterLink, DatePipe, MiniSessionModalComponent, ConfirmModalComponent],
  template: `
    <div class="w-full max-w-2xl mx-auto px-2 sm:px-0">

      <!-- Breadcrumb + actions -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div class="flex items-center gap-2 text-sm" style="color:#64748B;">
          <a routerLink="/dashboard/credentials" style="color:#2563EB; text-decoration:none;">
            <i class="fa-solid fa-arrow-left mr-1"></i>
            <span class="hidden sm:inline">Credentials</span>
          </a>
          <span class="hidden sm:inline" style="color:#E2E8F0;">/</span>
          <span class="hidden sm:inline" style="color:#0F172A; font-weight:500;">{{ credential()?.name }}</span>
        </div>

        @if (credential()) {
          <div class="flex items-center gap-2">
            <button (click)="requireSession('edit')" class="btn-outline" style="font-size:13px; padding:6px 12px;">
              <i class="fa-solid fa-pen mr-1.5"></i> Modifier
            </button>
            <button (click)="requireSession('delete')" class="btn-outline"
              style="font-size:13px; padding:6px 12px; color:#DC2626; border-color:#DC2626;"
              onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='#fff'">
              <i class="fa-solid fa-trash mr-1.5"></i> Supprimer
            </button>
          </div>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <i class="fa-solid fa-spinner fa-spin text-2xl" style="color:#2563EB;"></i>
        </div>
      } @else if (credential()) {

        <!-- Titre + badge session -->
        <div class="flex flex-wrap items-center gap-3 mb-5">
          <div class="flex items-center justify-center flex-shrink-0"
            style="width:40px; height:40px; border-radius:8px;"
            [style.background]="credential()!.type === 'password' ? '#EFF6FF' : '#ECFEFF'">
            <i [class]="credential()!.type === 'password' ? 'fa-solid fa-key' : 'fa-solid fa-ticket'"
              [style.color]="credential()!.type === 'password' ? '#2563EB' : '#06B6D4'"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="font-display text-lg sm:text-xl font-bold truncate" style="color:#0F172A;">{{ credential()!.name }}</h1>
            <span [class]="credential()!.type === 'password' ? 'badge-password' : 'badge-token'">
              {{ credential()!.type === 'password' ? 'Password' : 'Token' }}
            </span>
          </div>

          <!-- Indicateur mini-session -->
          @if (miniSession.isValid()) {
            <div class="flex items-center gap-1.5 px-3 py-1 rounded"
              style="background:#F0FDF4; border:1px solid #BBF7D0; flex-shrink:0;">
              <i class="fa-solid fa-shield-halved" style="color:#16A34A; font-size:11px;"></i>
              <span class="text-xs font-semibold" style="color:#16A34A;">
                {{ miniSession.formatRemaining() }}
              </span>
            </div>
          }
        </div>

        <!-- Infos publiques -->
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px sm:20px; margin-bottom:12px;">
          <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:#94A3B8;">
            <i class="fa-solid fa-circle-info mr-1.5"></i> Informations générales
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p class="text-xs font-semibold mb-1" style="color:#94A3B8;">Date de création</p>
              <p class="text-sm" style="color:#0F172A;">
                <i class="fa-regular fa-calendar mr-1.5" style="color:#CBD5E1;"></i>
                {{ credential()!.created_at | date:'dd/MM/yyyy' }}
              </p>
            </div>

            @if (credential()!.validity_date) {
              <div>
                <p class="text-xs font-semibold mb-1" style="color:#94A3B8;">Validité</p>
                <p class="text-sm" [style.color]="isExpired(credential()!.validity_date!) ? '#DC2626' : '#16A34A'">
                  <i [class]="isExpired(credential()!.validity_date!) ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'" class="mr-1.5"></i>
                  {{ credential()!.validity_date | date:'dd/MM/yyyy' }}
                  {{ isExpired(credential()!.validity_date!) ? '(Expiré)' : '(Valide)' }}
                </p>
              </div>
            }

            @if (credential()!.url) {
              <div class="sm:col-span-2">
                <p class="text-xs font-semibold mb-1" style="color:#94A3B8;">URL</p>
                <a [href]="credential()!.url" target="_blank" class="text-sm break-all" style="color:#2563EB;">
                  <i class="fa-solid fa-globe mr-1.5"></i>{{ credential()!.url }}
                </a>
              </div>
            }

            @if (credential()!.description) {
              <div class="sm:col-span-2">
                <p class="text-xs font-semibold mb-1" style="color:#94A3B8;">Description</p>
                <p class="text-sm" style="color:#374151;">{{ credential()!.description }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Données sensibles -->
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px;">
          <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:#94A3B8;">
            <i class="fa-solid fa-lock mr-1.5"></i> Données sensibles
          </p>

          @if (!secrets()) {
            <div class="text-center py-6">
              <i class="fa-solid fa-shield-halved text-3xl mb-3 block" style="color:#CBD5E1;"></i>
              <p class="text-sm mb-4" style="color:#64748B;">Vérification requise pour voir les données</p>
              <button (click)="requireSession('reveal')" class="btn-primary" style="font-size:13px;">
                <i class="fa-solid fa-unlock mr-1.5"></i> Déverrouiller
              </button>
            </div>
          } @else {
            <div class="space-y-3">
              @if (secrets()!.username) {
                <div class="flex flex-wrap items-center justify-between gap-2 py-2 px-3" style="background:#F8FAFF; border-radius:5px;">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold mb-0.5" style="color:#94A3B8;">
                      <i class="fa-solid fa-user mr-1"></i> Username
                    </p>
                    <p class="text-sm font-mono truncate" style="color:#0F172A;">{{ secrets()!.username }}</p>
                  </div>
                  <button (click)="copy('username', secrets()!.username!)" class="btn-outline flex-shrink-0" style="font-size:12px; padding:4px 10px;">
                    <i [class]="copied === 'username' ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="mr-1"></i>
                    {{ copied === 'username' ? 'Copié' : 'Copier' }}
                  </button>
                </div>
              }

              @if (secrets()!.password) {
                <div class="flex flex-wrap items-center justify-between gap-2 py-2 px-3" style="background:#F8FAFF; border-radius:5px;">
                  <div class="min-w-0">
                    <p class="text-xs font-semibold mb-0.5" style="color:#94A3B8;">
                      <i class="fa-solid fa-lock mr-1"></i> Password
                    </p>
                    <p class="text-sm font-mono" style="color:#0F172A;">
                      {{ showSecret ? secrets()!.password : '••••••••••' }}
                    </p>
                  </div>
                  <div class="flex gap-1.5 flex-shrink-0">
                    <button (click)="showSecret = !showSecret" class="btn-outline" style="font-size:12px; padding:4px 10px;">
                      <i [class]="showSecret ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                    </button>
                    <button (click)="copy('password', secrets()!.password!)" class="btn-outline" style="font-size:12px; padding:4px 10px;">
                      <i [class]="copied === 'password' ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="mr-1"></i>
                      {{ copied === 'password' ? 'Copié' : 'Copier' }}
                    </button>
                  </div>
                </div>
              }

              @if (secrets()!.token) {
                <div class="py-2 px-3" style="background:#F8FAFF; border-radius:5px;">
                  <div class="flex items-center justify-between mb-1.5">
                    <p class="text-xs font-semibold" style="color:#94A3B8;">
                      <i class="fa-solid fa-ticket mr-1"></i> Token
                    </p>
                    <button (click)="copy('token', secrets()!.token!)" class="btn-outline" style="font-size:12px; padding:4px 10px;">
                      <i [class]="copied === 'token' ? 'fa-solid fa-check' : 'fa-regular fa-copy'" class="mr-1"></i>
                      {{ copied === 'token' ? 'Copié' : 'Copier' }}
                    </button>
                  </div>
                  <p class="text-xs font-mono break-all" style="color:#0F172A;">{{ secrets()!.token }}</p>
                </div>
              }

              <button (click)="secrets.set(null)"
                class="text-xs" style="color:#94A3B8; background:none; border:none; cursor:pointer; padding:0;">
                <i class="fa-solid fa-lock mr-1"></i> Masquer les données
              </button>
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal mini-session -->
    @if (showMiniSession()) {
      <app-mini-session-modal
        (verified)="onSessionVerified()"
        (cancel)="showMiniSession.set(false); pendingAction = null">
      </app-mini-session-modal>
    }

    <!-- Modal confirmation suppression -->
    @if (showDeleteConfirm()) {
      <app-confirm-modal
        title="Supprimer ce credential"
        message="Cette action est irréversible. Le credential sera définitivement supprimé."
        confirmLabel="Supprimer"
        [danger]="true"
        (confirm)="doDelete()"
        (cancel)="showDeleteConfirm.set(false)">
      </app-confirm-modal>
    }
  `,
})
export class CredentialDetailComponent implements OnInit, OnDestroy {
  private credService  = inject(CredentialService);
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private toast        = inject(ToastService);
  miniSession          = inject(MiniSessionService);

  credential       = signal<Credential | null>(null);
  secrets          = signal<CredentialSecrets | null>(null);
  loading          = signal(true);
  showMiniSession  = signal(false);
  showDeleteConfirm = signal(false);

  pendingAction: PendingAction = null;
  showSecret = false;
  copied     = '';

  private expireCb = () => {
    this.secrets.set(null);
    this.toast.warning('Votre mini-session a expiré. Les données sensibles ont été masquées.');
  };

  ngOnInit() {
    this.miniSession.onExpire(this.expireCb);
    const id = this.route.snapshot.paramMap.get('id')!;
    this.credService.getOne(id).subscribe({
      next: (c) => { this.credential.set(c); this.loading.set(false); },
      error: () => this.router.navigate(['/dashboard/credentials']),
    });
  }

  ngOnDestroy() {
    this.miniSession.removeExpireCallback(this.expireCb);
  }

  requireSession(action: PendingAction) {
    if (this.miniSession.isValid()) {
      this.executeAction(action);
    } else {
      this.pendingAction = action;
      this.showMiniSession.set(true);
    }
  }

  onSessionVerified() {
    this.showMiniSession.set(false);
    this.executeAction(this.pendingAction);
    this.pendingAction = null;
  }

  private executeAction(action: PendingAction) {
    if (action === 'reveal') this.loadSecrets();
    if (action === 'edit')   this.router.navigate(['/dashboard/credentials', this.credential()!.id, 'edit']);
    if (action === 'delete') this.showDeleteConfirm.set(true);
  }

  private loadSecrets() {
    this.credService.reveal(this.credential()!.id).subscribe((s) => this.secrets.set(s));
  }

  doDelete() {
    this.showDeleteConfirm.set(false);
    this.credService.delete(this.credential()!.id).subscribe({
      next: () => {
        this.toast.success('Credential supprimé avec succès.');
        this.router.navigate(['/dashboard/credentials']);
      },
      error: () => this.toast.error('Erreur lors de la suppression.'),
    });
  }

  copy(key: string, value: string) {
    navigator.clipboard.writeText(value);
    this.copied = key;
    this.toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} copié !`);
    setTimeout(() => this.copied = '', 2000);
  }

  isExpired(d: string) { return new Date(d) < new Date(); }
}
