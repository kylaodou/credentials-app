import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-pwa-install',
  imports: [],
  styleUrl: './pwa-install.component.css',
  templateUrl: './pwa-install.component.html',
})
export class PwaInstallComponent implements OnInit {
  show = signal(false);
  private deferredPrompt: any = null;

  ngOnInit() {
    // Ne pas afficher si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;

      // Afficher après 3 secondes
      setTimeout(() => {
        if (!localStorage.getItem('pwa-dismissed')) {
          this.show.set(true);
        }
      }, 3000);
    });
  }

  install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then(() => {
      this.deferredPrompt = null;
      this.show.set(false);
    });
  }

  dismiss() {
    this.show.set(false);
    localStorage.setItem('pwa-dismissed', '1');
  }
}
