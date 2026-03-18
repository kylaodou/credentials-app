import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Credential } from '../../../core/models';
import { CredentialService } from '../../../core/services/credential.service';

@Component({
  selector: 'app-credential-list',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-display text-xl font-bold" style="color:#0F172A;">Mes Credentials</h2>
          <p class="text-xs mt-0.5" style="color:#94A3B8;">{{ credentials().length }} enregistré(s)</p>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <i class="fa-solid fa-plus mr-1.5"></i> Nouveau
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mb-5">
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px;" class="flex items-center gap-3">
          <i class="fa-solid fa-key" style="color:#2563EB;"></i>
          <div>
            <p class="font-bold text-lg" style="color:#0F172A;">{{ countByType('password') }}</p>
            <p class="text-xs" style="color:#94A3B8;">Passwords</p>
          </div>
        </div>
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px;" class="flex items-center gap-3">
          <i class="fa-solid fa-ticket" style="color:#06B6D4;"></i>
          <div>
            <p class="font-bold text-lg" style="color:#0F172A;">{{ countByType('token') }}</p>
            <p class="text-xs" style="color:#94A3B8;">Tokens</p>
          </div>
        </div>
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px;" class="flex items-center gap-3">
          <i class="fa-solid fa-triangle-exclamation" style="color:#F59E0B;"></i>
          <div>
            <p class="font-bold text-lg" style="color:#0F172A;">{{ countExpired() }}</p>
            <p class="text-xs" style="color:#94A3B8;">Expirés</p>
          </div>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="mb-4 pb-3" style="border-bottom:1px solid #E2E8F0;">
        <p class="text-xs font-semibold uppercase tracking-wide" style="color:#94A3B8;">
          <i class="fa-solid fa-list mr-1.5"></i> Liste des credentials
        </p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <i class="fa-solid fa-spinner fa-spin text-2xl" style="color:#2563EB;"></i>
        </div>
      } @else if (credentials().length === 0) {
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:48px;" class="text-center">
          <i class="fa-solid fa-lock text-4xl mb-3 block" style="color:#CBD5E1;"></i>
          <p class="font-semibold mb-1" style="color:#374151;">Aucun credential</p>
          
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          @for (cred of credentials(); track cred.id) {
            <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:16px; transition:border-color 0.15s;"
              onmouseover="this.style.borderColor='#BFDBFE'"
              onmouseout="this.style.borderColor='#E2E8F0'">

              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <i [class]="cred.type === 'password' ? 'fa-solid fa-key' : 'fa-solid fa-ticket'"
                    [style.color]="cred.type === 'password' ? '#2563EB' : '#06B6D4'"></i>
                  <span class="font-semibold text-sm truncate" style="color:#0F172A;">{{ cred.name }}</span>
                </div>
                <span [class]="cred.type === 'password' ? 'badge-password' : 'badge-token'">
                  {{ cred.type === 'password' ? 'Password' : 'Token' }}
                </span>
              </div>

              @if (cred.description) {
                <p class="text-xs mb-2 line-clamp-2" style="color:#64748B;">{{ cred.description }}</p>
              }

              @if (cred.url) {
                <p class="text-xs truncate mb-2" style="color:#2563EB;">
                  <i class="fa-solid fa-globe mr-1"></i>{{ cred.url }}
                </p>
              }

              <div class="flex items-center justify-between mb-3 pt-2" style="border-top:1px solid #F1F5F9;">
                <span class="text-xs" style="color:#CBD5E1;">{{ cred.created_at | date:'dd/MM/yyyy' }}</span>
                @if (cred.validity_date) {
                  <span class="text-xs" [style.color]="isExpired(cred.validity_date) ? '#DC2626' : '#16A34A'">
                    <i [class]="isExpired(cred.validity_date) ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'" class="mr-1"></i>
                    {{ isExpired(cred.validity_date) ? 'Expiré' : 'Valide' }}
                  </span>
                }
              </div>

              <a [routerLink]="['/dashboard/credentials', cred.id]"
                class="btn-primary w-full" style="display:flex; justify-content:center; text-decoration:none; font-size:13px; padding:8px;">
                <i class="fa-solid fa-eye mr-1.5"></i> Voir les détails
              </a>
            </div>
          }
        </div>
      }
    </div>

    <!-- MODAL -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background:rgba(0,0,0,0.4);"
        (click)="closeModal()">
        <div style="background:#fff; border-radius:8px; width:100%; max-width:500px; max-height:90vh; overflow-y:auto;"
          (click)="$event.stopPropagation()">

          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #E2E8F0;">
            <h3 class="font-bold text-base" style="color:#0F172A;">Nouveau credential</h3>
            <button (click)="closeModal()" style="background:none; border:none; color:#94A3B8; cursor:pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="p-5">
            <form [formGroup]="activeForm" (ngSubmit)="submitModal()">

              <!-- Type selector -->
              <div class="flex gap-2 mb-4">
                <button type="button" (click)="setType('password')"
                  class="flex-1 py-2 text-sm font-semibold cursor-pointer"
                  style="border-radius:5px; border:1px solid;"
                  [style.background]="currentType() === 'password' ? '#2563EB' : '#fff'"
                  [style.color]="currentType() === 'password' ? '#fff' : '#64748B'"
                  [style.borderColor]="currentType() === 'password' ? '#2563EB' : '#E2E8F0'">
                  <i class="fa-solid fa-key mr-1.5"></i> Password
                </button>
                <button type="button" (click)="setType('token')"
                  class="flex-1 py-2 text-sm font-semibold cursor-pointer"
                  style="border-radius:5px; border:1px solid;"
                  [style.background]="currentType() === 'token' ? '#06B6D4' : '#fff'"
                  [style.color]="currentType() === 'token' ? '#fff' : '#64748B'"
                  [style.borderColor]="currentType() === 'token' ? '#06B6D4' : '#E2E8F0'">
                  <i class="fa-solid fa-ticket mr-1.5"></i> Token
                </button>
              </div>

              <div class="space-y-3">
                <!-- Nom — toujours requis -->
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                    Nom <span style="color:#DC2626;">*</span>
                  </label>
                  <input type="text" formControlName="name" class="input" placeholder="Ex: GitHub, AWS..." />
                </div>

                <!-- Champs password -->
                @if (currentType() === 'password') {
                  <div>
                    <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                      Username <span style="color:#DC2626;">*</span>
                    </label>
                    <input type="text" formControlName="username" class="input" placeholder="Nom d'utilisateur" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                      Password <span style="color:#DC2626;">*</span>
                    </label>
                    <div class="relative">
                      <input [type]="showPw() ? 'text' : 'password'" formControlName="password" class="input pr-9" />
                      <button type="button" (click)="showPw.set(!showPw())"
                        style="position:absolute; right:9px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94A3B8; cursor:pointer;">
                        <i [class]="showPw() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:13px;"></i>
                      </button>
                    </div>
                  </div>
                }

                <!-- Champs token -->
                @if (currentType() === 'token') {
                  <div>
                    <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                      Token <span style="color:#DC2626;">*</span>
                    </label>
                    <textarea formControlName="token" class="input resize-none" rows="3" placeholder="Votre token..."></textarea>
                  </div>
                }

                <!-- Optionnels -->
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">URL du site</label>
                  <input type="url" formControlName="url" class="input" placeholder="https://..." />
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">Description</label>
                  <textarea formControlName="description" class="input resize-none" rows="2"></textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">Date de validité</label>
                  <input type="date" formControlName="validity_date" class="input" />
                </div>
              </div>

              @if (modalError()) {
                <p class="text-xs mt-3" style="color:#DC2626;">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ modalError() }}
                </p>
              }

              <div class="flex gap-2 mt-5">
                <button type="button" (click)="closeModal()" class="btn-outline flex-1">Annuler</button>
                <button type="submit" [disabled]="activeForm.invalid || saving()" class="btn-primary flex-1 disabled:opacity-50">
                  @if (saving()) { <i class="fa-solid fa-spinner fa-spin mr-1.5"></i> } Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
})
export class CredentialListComponent implements OnInit {
  private credService = inject(CredentialService);
  private fb          = inject(FormBuilder);
  private router      = inject(Router);

  credentials = signal<Credential[]>([]);
  loading     = signal(true);
  showModal   = signal(false);
  saving      = signal(false);
  modalError  = signal('');
  showPw      = signal(false);
  currentType = signal<'password' | 'token'>('password');

  // Formulaires séparés par type
  passwordForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    url: [''], description: [''], validity_date: [''],
  });

  tokenForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    token: ['', Validators.required],
    url: [''], description: [''], validity_date: [''],
  });

  get activeForm(): FormGroup {
    return this.currentType() === 'password' ? this.passwordForm : this.tokenForm;
  }

  ngOnInit() {
    this.credService.getAll().subscribe({
      next: (d) => { this.credentials.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openModal() {
    this.passwordForm.reset();
    this.tokenForm.reset();
    this.currentType.set('password');
    this.modalError.set('');
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  setType(t: 'password' | 'token') { this.currentType.set(t); }

  countByType(t: string) { return this.credentials().filter(c => c.type === t).length; }
  countExpired() { return this.credentials().filter(c => c.validity_date && this.isExpired(c.validity_date)).length; }
  isExpired(d: string) { return new Date(d) < new Date(); }

  submitModal() {
    if (this.activeForm.invalid) return;
    this.saving.set(true);
    const data = { ...this.activeForm.value, type: this.currentType() };
    this.credService.create(data as any).subscribe({
      next: (c) => {
        this.credentials.update(l => [c, ...l]);
        this.closeModal();
        this.saving.set(false);
        this.router.navigate(['/dashboard/credentials', c.id]);
      },
      error: () => { this.modalError.set('Erreur lors de la création'); this.saving.set(false); },
    });
  }
}
