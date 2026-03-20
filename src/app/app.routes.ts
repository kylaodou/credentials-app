import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback/callback.component').then((m) => m.CallbackComponent),
  },
  {
    path: 'set-password',
    loadComponent: () => import('./features/auth/set-password/set-password.component').then((m) => m.SetPasswordComponent),
    canActivate: [authGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'otp-verify',
    loadComponent: () => import('./features/auth/otp-verify/otp-verify.component').then((m) => m.OtpVerifyComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'verify-password',
    loadComponent: () => import('./features/auth/verify-password/verify-password.component').then((m) => m.VerifyPasswordComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'credentials', pathMatch: 'full' },
      {
        path: 'credentials',
        loadComponent: () => import('./features/credentials/list/credential-list.component').then((m) => m.CredentialListComponent),
      },
      {
        path: 'credentials/:id',
        loadComponent: () => import('./features/credentials/detail/credential-detail.component').then((m) => m.CredentialDetailComponent),
      },
      {
        path: 'credentials/:id/edit',
        loadComponent: () => import('./features/credentials/form/credential-form.component').then((m) => m.CredentialFormComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
