import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .nav-link {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border-radius: 5px;
      font-size: 0.875rem; font-weight: 500;
      color: #64748B; transition: background 0.15s, color 0.15s;
      text-decoration: none; white-space: nowrap;
      cursor: pointer; border: none; background: none;
      width: 100%; text-align: left;
    }
    .nav-link:hover { background: #F1F5F9; color: #0F172A; }
    .nav-link.active { background: #EFF6FF; color: #2563EB; font-weight: 600; }
    .mobile-nav-link.active-mobile { color: #2563EB !important; }

    .tip-wrap { position: relative; }
    .tip-wrap .tip {
      display: none; position: absolute;
      left: calc(100% + 8px); top: 50%; transform: translateY(-50%);
      background: #1E293B; color: #fff; font-size: 12px; font-weight: 500;
      padding: 4px 10px; border-radius: 4px; white-space: nowrap; z-index: 200;
      pointer-events: none;
    }
    .tip-wrap:hover .tip { display: block; }

    .profile-wrap { position: relative; }
    .profile-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 10px; border-radius: 5px; cursor: pointer;
      border: 1px solid #E2E8F0; background: #fff; transition: background 0.15s;
    }
    .profile-btn:hover { background: #F8FAFF; }
    .profile-menu {
      display: none; position: absolute; right: 0; top: 100%;
      padding-top: 4px; z-index: 200; min-width: 200px;
    }
    .profile-wrap:hover .profile-menu { display: block; }
    .profile-menu-inner {
      background: #fff; border: 1px solid #E2E8F0; border-radius: 6px; overflow: hidden;
    }
    .menu-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px; font-size: 13px; color: #374151;
      cursor: pointer; transition: background 0.1s;
      text-decoration: none; border: none; background: none; width: 100%; text-align: left;
    }
    .menu-item:hover { background: #F8FAFF; }
    .menu-item.danger { color: #DC2626; }
    .menu-item.danger:hover { background: #FEF2F2; }

    .toggle-btn {
      position: absolute; right: -12px; top: 28px;
      width: 24px; height: 24px; border-radius: 50%;
      background: #fff; border: 1px solid #E2E8F0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 20; color: #64748B; transition: background 0.15s;
    }
    .toggle-btn:hover { background: #EFF6FF; color: #2563EB; }
  `],
  template: `
    <div class="flex min-h-screen" style="background:#fff;">

      <!-- SIDEBAR — masquée sur mobile -->
      <aside class="hidden md:flex flex-col flex-shrink-0 relative"
        [style.width]="collapsed() ? '52px' : '210px'"
        style="background:#fff; border-right:1px solid #E2E8F0; transition:width 0.2s ease; overflow:visible; z-index:10;">

        <!-- Logo -->
        <div class="flex items-center px-3 py-3" style="border-bottom:1px solid #E2E8F0; min-height:53px; gap:8px; overflow:hidden;">
          <img src="/img/logo.jpg" class="flex-shrink-0" style="width:28px; height:28px; border-radius:5px;" />
          @if (!collapsed()) {
            <span class="font-bold text-sm truncate" style="color:#0F172A;">Credential App</span>
          }
        </div>

        <!-- Toggle -->
        <button class="toggle-btn" (click)="collapsed.set(!collapsed())">
          <i [class]="collapsed() ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'" style="font-size:10px;"></i>
        </button>

        <!-- Nav -->
        <nav class="flex-1 px-2 py-4 space-y-0.5" style="overflow:visible;">
          @if (!collapsed()) {
            <p class="text-xs font-semibold px-2 mb-2 uppercase tracking-wider" style="color:#CBD5E1;">Menu</p>
          }
          <div class="tip-wrap">
            <a routerLink="/dashboard/credentials" routerLinkActive="active"
              [routerLinkActiveOptions]="{exact:false}" class="nav-link">
              <i class="fa-solid fa-key flex-shrink-0" style="width:16px; text-align:center; font-size:13px;"></i>
              @if (!collapsed()) { <span>Mes Credentials</span> }
            </a>
            @if (collapsed()) { <span class="tip">Mes Credentials</span> }
          </div>
        </nav>

        <!-- User -->
        <div class="px-2 py-3" style="border-top:1px solid #E2E8F0; overflow:visible;">
          @if (!collapsed() && auth.user()) {
            <div class="flex items-center gap-2 px-2 py-2 mb-1" style="background:#F8FAFF; border-radius:5px;">
              <div class="flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style="width:26px; height:26px; background:#2563EB;">
                {{ auth.user()!.name[0].toUpperCase() }}
              </div>
              <p class="text-xs font-medium truncate" style="color:#0F172A;">{{ auth.user()!.name }}</p>
            </div>
          }
          <div class="tip-wrap">
            <button (click)="auth.logout()" class="nav-link"
              onmouseover="this.style.background='#FEF2F2'; this.style.color='#DC2626'"
              onmouseout="this.style.background=''; this.style.color='#64748B'">
              <i class="fa-solid fa-right-from-bracket flex-shrink-0" style="width:16px; text-align:center; font-size:13px;"></i>
              @if (!collapsed()) { <span>Déconnexion</span> }
            </button>
            @if (collapsed()) { <span class="tip">Déconnexion</span> }
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Header -->
        <header class="flex items-center justify-between px-4 md:px-6"
          style="background:#fff; border-bottom:1px solid #E2E8F0; min-height:53px;">

          <!-- Logo mobile + Bonjour -->
          <div class="flex items-center gap-3">
            <img src="/img/logo.jpg" class="md:hidden flex-shrink-0" style="width:28px; height:28px; border-radius:5px;" />
            <div>
              <p class="font-bold text-sm md:text-base" style="color:#0F172A;">
                Bonjour{{ auth.user() ? ', ' + auth.user()!.name.split(' ')[0] : '' }} 👋
              </p>
              <p class="text-xs hidden sm:block" style="color:#94A3B8;">Gérez vos credentials en toute sécurité</p>
            </div>
          </div>

          <!-- Profil dropdown -->
          @if (auth.user()) {
            <div class="profile-wrap">
              <div class="profile-btn">
                <div class="rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style="width:28px; height:28px; background:#2563EB;">
                  {{ auth.user()!.name[0].toUpperCase() }}
                </div>
                <div class="hidden sm:block text-left">
                  <p class="text-sm font-semibold leading-tight" style="color:#0F172A;">{{ auth.user()!.name }}</p>
                  <p class="text-xs leading-tight" style="color:#94A3B8;">{{ auth.user()!.email }}</p>
                </div>
                <i class="fa-solid fa-chevron-down" style="font-size:10px; color:#94A3B8;"></i>
              </div>
              <div class="profile-menu">
                <div class="profile-menu-inner">
                  <div class="px-3 py-2" style="border-bottom:1px solid #F1F5F9;">
                    <p class="text-xs font-semibold" style="color:#0F172A;">{{ auth.user()!.name }}</p>
                    <p class="text-xs" style="color:#94A3B8;">{{ auth.user()!.email }}</p>
                  </div>
                  <a routerLink="/dashboard/profile" class="menu-item">
                    <i class="fa-solid fa-user" style="color:#64748B; width:14px;"></i> Mon profil
                  </a>
                  <button (click)="auth.logout()" class="menu-item danger">
                    <i class="fa-solid fa-right-from-bracket" style="width:14px;"></i> Déconnexion
                  </button>
                </div>
              </div>
            </div>
          }
        </header>

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6" style="background:#F8FAFF;">
          <router-outlet />
        </main>

        <!-- Nav mobile bottom -->
        <nav class="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
          style="background:#fff; border-top:1px solid #E2E8F0;">
          <a routerLink="/dashboard/credentials" routerLinkActive="active-mobile"
            [routerLinkActiveOptions]="{exact:false}"
            class="flex-1 flex flex-col items-center py-3 text-xs font-medium mobile-nav-link"
            style="color:#64748B; text-decoration:none;">
            <i class="fa-solid fa-key mb-1" style="font-size:16px;"></i>
            Credentials
          </a>
          <a routerLink="/dashboard/profile" routerLinkActive="active-mobile"
            class="flex-1 flex flex-col items-center py-3 text-xs font-medium mobile-nav-link"
            style="color:#64748B; text-decoration:none;">
            <i class="fa-solid fa-user mb-1" style="font-size:16px;"></i>
            Profil
          </a>
          <button (click)="auth.logout()"
            class="flex-1 flex flex-col items-center py-3 text-xs font-medium"
            style="color:#64748B; background:none; border:none; cursor:pointer;">
            <i class="fa-solid fa-right-from-bracket mb-1" style="font-size:16px;"></i>
            Quitter
          </button>
        </nav>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  collapsed = signal(false);
  ngOnInit() { if (!this.auth.user()) this.auth.loadMe().subscribe(); }
}
