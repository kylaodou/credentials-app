import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CredentialService } from '../../../core/services/credential.service';
import { MiniSessionService } from '../../../core/services/mini-session.service';
import { MiniSessionModalComponent } from '../../../shared/components/mini-session-modal/mini-session-modal.component';

@Component({
  selector: 'app-credential-form',
  imports: [ReactiveFormsModule, RouterLink, MiniSessionModalComponent],
  template: `
    <div class="w-full max-w-xl mx-auto px-4">
      <div class="flex items-center gap-3 mb-5">
        <a routerLink="/dashboard/credentials" style="color:#2563EB; text-decoration:none; font-size:13px;">
          <i class="fa-solid fa-arrow-left mr-1"></i> Retour
        </a>
        <span style="color:#E2E8F0;">/</span>
        <h1 class="font-display text-xl font-bold" style="color:#0F172A;">
          {{ isEdit ? 'Modifier' : 'Nouveau' }} credential
        </h1>
      </div>

      @if (isEdit && loadingSecrets()) {
        <div class="flex justify-center py-16">
          <i class="fa-solid fa-spinner fa-spin text-2xl" style="color:#2563EB;"></i>
        </div>
      } @else {
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:24px;">
          <form [formGroup]="form" (ngSubmit)="submit()">

            <!-- Type -->
            <div class="flex gap-2 mb-5">
              <button type="button" (click)="setType('password')"
                class="flex-1 py-2 text-sm font-semibold cursor-pointer"
                style="border-radius:5px; border:1px solid;"
                [style.background]="form.value.type === 'password' ? '#2563EB' : '#fff'"
                [style.color]="form.value.type === 'password' ? '#fff' : '#64748B'"
                [style.borderColor]="form.value.type === 'password' ? '#2563EB' : '#E2E8F0'">
                <i class="fa-solid fa-key mr-1.5"></i> Password
              </button>
              <button type="button" (click)="setType('token')"
                class="flex-1 py-2 text-sm font-semibold cursor-pointer"
                style="border-radius:5px; border:1px solid;"
                [style.background]="form.value.type === 'token' ? '#06B6D4' : '#fff'"
                [style.color]="form.value.type === 'token' ? '#fff' : '#64748B'"
                [style.borderColor]="form.value.type === 'token' ? '#06B6D4' : '#E2E8F0'">
                <i class="fa-solid fa-ticket mr-1.5"></i> Token
              </button>
            </div>

            <div class="space-y-3">

              <!-- Nom -->
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                  Nom <span style="color:#DC2626;">*</span>
                </label>
                <input type="text" formControlName="name" class="input" placeholder="Ex: GitHub, AWS..." />
                @if (fe('name')) {
                  <p class="text-xs mt-1" style="color:#DC2626;">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('name') }}
                  </p>
                }
              </div>

              @if (form.value.type === 'password') {
                <!-- Username -->
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                    Username <span style="color:#DC2626;">*</span>
                  </label>
                  <input type="text" formControlName="username" class="input" placeholder="Nom d'utilisateur" />
                  @if (fe('username')) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('username') }}
                    </p>
                  }
                </div>
                <!-- Password -->
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
                  @if (fe('password')) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('password') }}
                    </p>
                  }
                </div>
              } @else {
                <!-- Token -->
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                    Token <span style="color:#DC2626;">*</span>
                  </label>
                  <textarea formControlName="token" class="input resize-none" rows="3" placeholder="Votre token..."></textarea>
                  @if (fe('token')) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('token') }}
                    </p>
                  }
                </div>
              }

              <!-- URL -->
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:#374151;">URL du site</label>
                <input type="url" formControlName="url" class="input" placeholder="https://..." />
                @if (fe('url')) {
                  <p class="text-xs mt-1" style="color:#DC2626;">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('url') }}
                  </p>
                }
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:#374151;">Description</label>
                <textarea formControlName="description" class="input resize-none" rows="2"></textarea>
              </div>

              <!-- Date de validité -->
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:#374151;">Date de validité</label>
                <input type="date" formControlName="validity_date" class="input" />
                @if (fe('validity_date')) {
                  <p class="text-xs mt-1" style="color:#DC2626;">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fe('validity_date') }}
                  </p>
                }
              </div>
            </div>

            @if (error()) {
              <p class="text-xs mt-3" style="color:#DC2626;">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ error() }}
              </p>
            }

            <div class="flex gap-2 mt-5">
              <a routerLink="/dashboard/credentials" class="btn-outline flex-1 text-center" style="text-decoration:none;">Annuler</a>
              <button type="submit" [disabled]="form.invalid || loading()" class="btn-primary flex-1 disabled:opacity-50">
                @if (loading()) { <i class="fa-solid fa-spinner fa-spin mr-1.5"></i> }
                {{ isEdit ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>

    @if (showMiniSession()) {
      <app-mini-session-modal
        (verified)="onSessionVerified()"
        (cancel)="router.navigate(['/dashboard/credentials'])">
      </app-mini-session-modal>
    }
  `,
})
export class CredentialFormComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private credService = inject(CredentialService);
  private miniSession = inject(MiniSessionService);
  router              = inject(Router);
  private route       = inject(ActivatedRoute);

  isEdit          = false;
  credId: string | null = null;
  loading         = signal(false);
  loadingSecrets  = signal(false);
  error           = signal('');
  fieldErrors     = signal<Record<string, string>>({});
  showPw          = signal(false);
  showMiniSession = signal(false);

  form = this.fb.group({
    name: ['', Validators.required], type: ['password'],
    username: [''], password: [''], token: [''],
    url: [''], description: [''], validity_date: [''],
  });

  // Helper pour accéder aux erreurs par champ
  fe(field: string): string { return this.fieldErrors()[field] ?? ''; }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some((s) => s.path === 'edit')) {
      this.isEdit = true;
      this.credId = id;
      this.credService.getOne(id).subscribe((c) => {
        this.form.patchValue({
          name: c.name, type: c.type,
          url: c.url ?? '', description: c.description ?? '', validity_date: c.validity_date ?? '',
        });
        if (this.miniSession.isValid()) this.loadSensitiveData();
        else this.showMiniSession.set(true);
      });
    }
  }

  onSessionVerified() { this.showMiniSession.set(false); this.loadSensitiveData(); }

  private loadSensitiveData() {
    this.loadingSecrets.set(true);
    this.credService.reveal(this.credId!).subscribe({
      next: (s) => {
        this.form.patchValue({ username: s.username ?? '', password: s.password ?? '', token: s.token ?? '' });
        this.loadingSecrets.set(false);
      },
      error: () => this.loadingSecrets.set(false),
    });
  }

  setType(type: 'password' | 'token') {
    if (type === 'password') this.form.patchValue({ token: '' });
    else this.form.patchValue({ username: '', password: '' });
    this.form.patchValue({ type });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.fieldErrors.set({});
    const obs = this.isEdit
      ? this.credService.update(this.credId!, this.form.value as any)
      : this.credService.create(this.form.value as any);

    obs.subscribe({
      next: (c) => this.router.navigate(['/dashboard/credentials', c.id]),
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          const fe: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(err.error.errors)) {
            fe[field] = (msgs as string[])[0];
          }
          this.fieldErrors.set(fe);
        } else {
          this.error.set('Erreur lors de l\'enregistrement');
        }
        this.loading.set(false);
      },
    });
  }
}
