import { Injectable, NgZone, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/** Déconnexion après 30 minutes sans activité (le serveur applique la même règle). */
export const IDLE_LIMIT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const CHECK_EVERY_MS = 15 * 1000;
const STORAGE_KEY = 'last_activity';
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'];

/**
 * Surveille l'activité de l'utilisatrice. L'heure de la dernière activité est partagée
 * entre les onglets (localStorage) : travailler dans un onglet garde les autres ouverts.
 */
@Injectable({ providedIn: 'root' })
export class IdleService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private zone = inject(NgZone);

  private timer: ReturnType<typeof setInterval> | null = null;
  private warned = false;
  private lastWrite = 0;

  start() {
    if (this.timer) return;
    this.zone.runOutsideAngular(() => {
      EVENTS.forEach((e) => window.addEventListener(e, this.onActivity, { passive: true }));
      document.addEventListener('visibilitychange', this.check);
      window.addEventListener('storage', this.onStorage);
      this.timer = setInterval(this.check, CHECK_EVERY_MS);
    });
    if (!localStorage.getItem(STORAGE_KEY)) this.touch(true);
  }

  /** Temps écoulé depuis la dernière activité, tous onglets confondus. */
  idleFor(now = Date.now()): number {
    const last = Number(localStorage.getItem(STORAGE_KEY) || now);
    return now - last;
  }

  /** Heure de dernière activité remise à maintenant (appelée aussi à la connexion). */
  touch(force = false) {
    const now = Date.now();
    // Écriture au plus toutes les 5 secondes pour ne pas solliciter le stockage à chaque mouvement.
    if (!force && now - this.lastWrite < 5000) return;
    this.lastWrite = now;
    this.warned = false;
    localStorage.setItem(STORAGE_KEY, String(now));
  }

  private onActivity = () => {
    if (this.auth.isLoggedIn()) this.touch();
  };

  private onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) this.warned = false;
    // Déconnexion dans un autre onglet : on suit.
    if (e.key === 'token' && !e.newValue && this.auth.isLoggedIn()) {
      this.zone.run(() => this.auth.clearSession());
    }
  };

  private check = () => {
    if (!this.auth.isLoggedIn()) return;
    const idle = this.idleFor();

    if (idle >= IDLE_LIMIT_MS) {
      this.zone.run(() => this.auth.logout('Vous avez été déconnectée après 30 minutes d\'inactivité.'));
      return;
    }

    if (idle >= IDLE_LIMIT_MS - WARNING_BEFORE_MS && !this.warned) {
      this.warned = true;
      this.zone.run(() =>
        this.toast.show('Sans activité, vous serez déconnectée dans 2 minutes. Bougez la souris pour rester connectée.', 'warning', 10000),
      );
    }
  };
}
