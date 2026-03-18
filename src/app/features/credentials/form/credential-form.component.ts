import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CredentialService } from '../../../core/services/credential.service';

@Component({
  selector: 'app-credential-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-xl mx-auto">
      <div class="flex items-center gap-3 mb-5">
        <a routerLink="/dashboard/credentials" style="color:#2563EB; text-decoration:none; font-size:13px;">
          <i class="fa-solid fa-arrow-left mr-1"></i> Retour
        </a>
        <span style="color:#E2E8F0;">/</span>
        <h1 class="font-display text-xl font-bold" style="color:#0F172A;">
          {{ isEdit ? 'Modifier' : 'Nouveau' }} credential
        </h1>
      </div>

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
            <div>
              <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                Nom <span style="color:#DC2626;">*</span>
              </label>
              <input type="text" formControlName="name" class="input" placeholder="Ex: GitHub, AWS..." />
            </div>

            @if (form.value.type === 'password') {
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
            } @else {
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                  Token <span style="color:#DC2626;">*</span>
                </label>
                <textarea formControlName="token" class="input resize-none" rows="3" placeholder="Votre token..."></textarea>
              </div>
            }

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
    </div>
  `,
})
export class CredentialFormComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private credService = inject(CredentialService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);

  isEdit  = false;
  credId: string | null = null;
  loading = signal(false);
  error   = signal('');
  showPw  = signal(false);

  form = this.fb.group({
    name:          ['', Validators.required],
    type:          ['password'],
    username:      [''],
    password:      [''],
    token:         [''],
    url:           [''],
    description:   [''],
    validity_date: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some((s) => s.path === 'edit')) {
      this.isEdit = true;
      this.credId = id;
      this.credService.getOne(id).subscribe((c) => this.form.patchValue(c));
    }
  }

  setType(type: 'password' | 'token') {
    // Reset les champs de l'autre type
    if (type === 'password') this.form.patchValue({ token: '' });
    else this.form.patchValue({ username: '', password: '' });
    this.form.patchValue({ type });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const data = this.form.value;
    const obs = this.isEdit
      ? this.credService.update(this.credId!, data as any)
      : this.credService.create(data as any);

    obs.subscribe({
      next: (c) => this.router.navigate(['/dashboard/credentials', c.id]),
      error: () => { this.error.set('Erreur lors de l\'enregistrement'); this.loading.set(false); },
    });
  }
}
