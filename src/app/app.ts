import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaInstallComponent } from './shared/components/pwa-install/pwa-install.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { IdleService } from './core/services/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaInstallComponent, ToastComponent],
  template: `
    <router-outlet />
    <app-pwa-install />
    <app-toast />
  `,
})
export class App {
  constructor() {
    inject(IdleService).start();
  }
}
