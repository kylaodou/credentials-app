import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallComponent } from './shared/components/pwa-install/pwa-install.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallComponent, ToastComponent],
  template: `
    <router-outlet />
    <app-pwa-install />
    <app-toast />
  `,
})
export class App {}
