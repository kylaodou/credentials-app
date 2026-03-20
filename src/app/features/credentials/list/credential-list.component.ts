import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Credential } from '../../../core/models';
import { CredentialService } from '../../../core/services/credential.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-credential-list',
  imports: [RouterLink, DatePipe, ReactiveFormsModule, FormsModule],
  template: `
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="font-display text-xl font-bold" style="color:#0F172A;">Mes Credentials</h2>
          <p class="text-xs mt-0.5" style="color:#94A3B8;">{{ credentials().length }} enregistré(s)</p>
        </div>
        <button (click)="openModal()" class="btn-primary">
          <i class="fa-solid fa-plus mr-1.5"></i>
          <span class="hidden sm:inline">Nouveau</span>
        </button>
      </div>

      <!-- Stats — responsive -->
      <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:12px;" class="flex items-center gap-2">
          <i class="fa-solid fa-key flex-shrink-0" style="color:#2563EB; font-size:14px;"></i>
          <div class="min-w-0">
            <p class="font-bold text-base sm:text-lg leading-tight" style="color:#0F172A;">{{ countByType('password') }}</p>
            <p class="text-xs truncate" style="color:#94A3B8;">Passwords</p>
          </div>
        </div>
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:12px;" class="flex items-center gap-2">
          <i class="fa-solid fa-ticket flex-shrink-0" style="color:#06B6D4; font-size:14px;"></i>
          <div class="min-w-0">
            <p class="font-bold text-base sm:text-lg leading-tight" style="color:#0F172A;">{{ countByType('token') }}</p>
            <p class="text-xs truncate" style="color:#94A3B8;">Tokens</p>
          </div>
        </div>
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:12px;" class="flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation flex-shrink-0" style="color:#F59E0B; font-size:14px;"></i>
          <div class="min-w-0">
            <p class="font-bold text-base sm:text-lg leading-tight" style="color:#0F172A;">{{ countExpired() }}</p>
            <p class="text-xs truncate" style="color:#94A3B8;">Expirés</p>
          </div>
        </div>
      </div>

      <!-- Barre de recherche + filtres + séparateur -->
      <div class="mb-4">
        <!-- Recherche -->
        <div class="relative mb-2">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2" style="color:#94A3B8; font-size:13px;"></i>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event); onSearch()"
            class="input pl-9" placeholder="Rechercher..." />
          @if (search()) {
            <button (click)="search.set(''); onSearch()"
              class="absolute right-3 top-1/2 -translate-y-1/2"
              style="background:none; border:none; color:#94A3B8; cursor:pointer; font-size:13px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          }
        </div>

        <!-- Filtres type — pleine largeur sur mobile -->
        <div class="flex gap-1 mb-3">
          <button (click)="setFilter('all')"
            class="flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all"
            [style.background]="filter() === 'all' ? '#2563EB' : '#fff'"
            [style.color]="filter() === 'all' ? '#fff' : '#64748B'"
            [style.border]="filter() === 'all' ? '1px solid #2563EB' : '1px solid #E2E8F0'">
            Tous
          </button>
          <button (click)="setFilter('password')"
            class="flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all"
            [style.background]="filter() === 'password' ? '#2563EB' : '#fff'"
            [style.color]="filter() === 'password' ? '#fff' : '#64748B'"
            [style.border]="filter() === 'password' ? '1px solid #2563EB' : '1px solid #E2E8F0'">
            <i class="fa-solid fa-key mr-1"></i> Password
          </button>
          <button (click)="setFilter('token')"
            class="flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-all"
            [style.background]="filter() === 'token' ? '#06B6D4' : '#fff'"
            [style.color]="filter() === 'token' ? '#fff' : '#64748B'"
            [style.border]="filter() === 'token' ? '1px solid #06B6D4' : '1px solid #E2E8F0'">
            <i class="fa-solid fa-ticket mr-1"></i> Token
          </button>
        </div>

        <div class="flex items-center justify-between pb-3" style="border-bottom:1px solid #E2E8F0;">
          <p class="text-xs font-semibold uppercase tracking-wide" style="color:#94A3B8;">
            <i class="fa-solid fa-list mr-1.5"></i>
            {{ filtered().length }} résultat(s)
          </p>
          @if (totalPages() > 1) {
            <p class="text-xs" style="color:#94A3B8;">Page {{ page() }} / {{ totalPages() }}</p>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <i class="fa-solid fa-spinner fa-spin text-2xl" style="color:#2563EB;"></i>
        </div>
      } @else if (paged().length === 0) {
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:40px;" class="text-center">
          <i class="fa-solid fa-lock text-4xl mb-3 block" style="color:#CBD5E1;"></i>
          <p class="font-semibold mb-1" style="color:#374151;">
            {{ search() ? 'Aucun résultat' : 'Aucun credential' }}
          </p>
          @if (!search()) {
            <p class="text-sm mb-4" style="color:#94A3B8;">Commencez par en ajouter un</p>
            <button (click)="openModal()" class="btn-primary" style="font-size:13px;">
              <i class="fa-solid fa-plus mr-1.5"></i> Ajouter
            </button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          @for (cred of paged(); track cred.id) {
            <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:14px; transition:border-color 0.15s;"
              onmouseover="this.style.borderColor='#BFDBFE'"
              onmouseout="this.style.borderColor='#E2E8F0'">

              <div class="flex items-start justify-between mb-2 gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <i [class]="cred.type === 'password' ? 'fa-solid fa-key' : 'fa-solid fa-ticket'"
                    [style.color]="cred.type === 'password' ? '#2563EB' : '#06B6D4'"
                    class="flex-shrink-0"></i>
                  <span class="font-semibold text-sm" style="color:#0F172A; word-break:break-word;">{{ cred.name }}</span>
                </div>
                <span [class]="cred.type === 'password' ? 'badge-password' : 'badge-token'" class="flex-shrink-0">
                  {{ cred.type === 'password' ? 'Password' : 'Token' }}
                </span>
              </div>

              @if (cred.description) {
                <p class="text-xs mb-2 line-clamp-2" style="color:#64748B;">{{ cred.description }}</p>
              }
              @if (cred.url) {
                <a [href]="cred.url" target="_blank" class="text-xs truncate mb-2 block" style="color:#2563EB; text-decoration:none;"
                  (click)="$event.stopPropagation()">
                  <i class="fa-solid fa-globe mr-1"></i>{{ cred.url }}
                </a>
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

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2 mt-6">
            <button (click)="prevPage()" [disabled]="page() === 1" class="btn-outline disabled:opacity-40" style="font-size:13px; padding:6px 12px;">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            @for (p of pageNumbers(); track p) {
              <button (click)="goToPage(p)"
                class="text-sm font-semibold px-3 py-1.5 rounded"
                [style.background]="p === page() ? '#2563EB' : '#fff'"
                [style.color]="p === page() ? '#fff' : '#64748B'"
                [style.border]="p === page() ? '1px solid #2563EB' : '1px solid #E2E8F0'"
                style="cursor:pointer; min-width:36px;">
                {{ p }}
              </button>
            }
            <button (click)="nextPage()" [disabled]="page() === totalPages()" class="btn-outline disabled:opacity-40" style="font-size:13px; padding:6px 12px;">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        }
      }
    </div>

    <!-- MODAL / BOTTOM SHEET -->
    @if (showModal()) {
      <!-- Backdrop -->
      <div class="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4"
        style="background:rgba(0,0,0,0.4);"
        (click)="closeModal()">

        <!-- Desktop: modal centré | Mobile: bottom sheet -->
        <div (click)="$event.stopPropagation()"
          class="fixed sm:relative bottom-0 sm:bottom-auto left-0 right-0 sm:left-auto sm:right-auto overflow-y-auto"
          style="background:#fff; width:100%; max-width:500px; max-height:92vh;
                 border-radius:16px 16px 0 0; sm:border-radius:8px;">

          <!-- Handle mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-1">
            <div style="width:40px; height:4px; background:#E2E8F0; border-radius:2px;"></div>
          </div>

          <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #E2E8F0;">
            <h3 class="font-bold text-base" style="color:#0F172A;">Nouveau credential</h3>
            <button (click)="closeModal()" style="background:none; border:none; color:#94A3B8; cursor:pointer;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="p-5 pb-8 sm:pb-5">
            <form [formGroup]="activeForm" (ngSubmit)="submitModal()">
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
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                    Nom <span style="color:#DC2626;">*</span>
                  </label>
                  <input type="text" formControlName="name" class="input" placeholder="Ex: GitHub, AWS..." />
                  @if (fieldErrors()['name']) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['name'] }}
                    </p>
                  }
                </div>

                @if (currentType() === 'password') {
                  <div>
                    <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                      Username <span style="color:#DC2626;">*</span>
                    </label>
                    <input type="text" formControlName="username" class="input" />
                    @if (fieldErrors()['username']) {
                      <p class="text-xs mt-1" style="color:#DC2626;">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['username'] }}
                      </p>
                    }
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
                    @if (fieldErrors()['password']) {
                      <p class="text-xs mt-1" style="color:#DC2626;">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['password'] }}
                      </p>
                    }
                  </div>
                }

                @if (currentType() === 'token') {
                  <div>
                    <label class="block text-xs font-semibold mb-1" style="color:#374151;">
                      Token <span style="color:#DC2626;">*</span>
                    </label>
                    <textarea formControlName="token" class="input resize-none" rows="3"></textarea>
                    @if (fieldErrors()['token']) {
                      <p class="text-xs mt-1" style="color:#DC2626;">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['token'] }}
                      </p>
                    }
                  </div>
                }

                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">URL du site</label>
                  <input type="url" formControlName="url" class="input" placeholder="https://..." />
                  @if (fieldErrors()['url']) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['url'] }}
                    </p>
                  }
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">Description</label>
                  <textarea formControlName="description" class="input resize-none" rows="2"></textarea>
                </div>
                <div>
                  <label class="block text-xs font-semibold mb-1" style="color:#374151;">Date de validité</label>
                  <input type="date" formControlName="validity_date" class="input" />
                  @if (fieldErrors()['validity_date']) {
                    <p class="text-xs mt-1" style="color:#DC2626;">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ fieldErrors()['validity_date'] }}
                    </p>
                  }
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
  fieldErrors = signal<Record<string, string>>({});
  showPw      = signal(false);
  currentType = signal<'password' | 'token'>('password');
  page        = signal(1);
  search      = signal('');
  filter      = signal<'all' | 'password' | 'token'>('all');

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const f = this.filter();
    return this.credentials().filter(c => {
      const matchType   = f === 'all' || c.type === f;
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.url ?? '').toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  });

  paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const cur   = this.page();
    const pages: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i);
    return pages;
  });

  passwordForm: FormGroup = this.fb.group({
    name: ['', Validators.required], username: ['', Validators.required],
    password: ['', Validators.required], url: [''], description: [''], validity_date: [''],
  });

  tokenForm: FormGroup = this.fb.group({
    name: ['', Validators.required], token: ['', Validators.required],
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

  onSearch() { this.page.set(1); }
  setFilter(f: 'all' | 'password' | 'token') { this.filter.set(f); this.page.set(1); }
  openModal()  { this.passwordForm.reset(); this.tokenForm.reset(); this.currentType.set('password'); this.modalError.set(''); this.fieldErrors.set({}); this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }
  setType(t: 'password' | 'token') { this.currentType.set(t); }

  countByType(t: string) { return this.credentials().filter(c => c.type === t).length; }
  countExpired()         { return this.credentials().filter(c => c.validity_date && this.isExpired(c.validity_date)).length; }
  isExpired(d: string)   { return new Date(d) < new Date(); }

  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }
  goToPage(p: number) { this.page.set(p); }

  submitModal() {
    if (this.activeForm.invalid) return;
    this.saving.set(true);
    const data = { ...this.activeForm.value, type: this.currentType() };
    this.credService.create(data as any).subscribe({
      next: (c) => {
        this.credentials.update(l => [c, ...l]);
        this.closeModal(); this.saving.set(false);
        this.router.navigate(['/dashboard/credentials', c.id]);
      },
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          // Erreurs par champ
          const fe: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(err.error.errors)) {
            fe[field] = (msgs as string[])[0];
          }
          this.fieldErrors.set(fe);
          this.modalError.set('');
        } else {
          this.modalError.set('Erreur lors de la création');
        }
        this.saving.set(false);
      },
    });
  }
}
