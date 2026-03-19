import { Injectable, signal } from '@angular/core';

const SESSION_DURATION = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class MiniSessionService {
  verified    = signal(false);
  secondsLeft = signal(0);

  private expiresAt: number | null = null;
  private expireTimer: any;
  private countdownTimer: any;
  private onExpireCallbacks: (() => void)[] = [];

  isValid(): boolean {
    if (!this.expiresAt) return false;
    if (Date.now() > this.expiresAt) { this.clear(); return false; }
    return true;
  }

  grant() {
    this.expiresAt = Date.now() + SESSION_DURATION;
    this.verified.set(true);
    this.secondsLeft.set(300);

    clearTimeout(this.expireTimer);
    clearInterval(this.countdownTimer);

    this.expireTimer = setTimeout(() => this.expire(), SESSION_DURATION);

    this.countdownTimer = setInterval(() => {
      const remaining = Math.max(0, Math.round((this.expiresAt! - Date.now()) / 1000));
      this.secondsLeft.set(remaining);
      if (remaining <= 0) clearInterval(this.countdownTimer);
    }, 1000);
  }

  onExpire(cb: () => void) {
    this.onExpireCallbacks.push(cb);
  }

  removeExpireCallback(cb: () => void) {
    this.onExpireCallbacks = this.onExpireCallbacks.filter(x => x !== cb);
  }

  private expire() {
    this.clear();
    this.onExpireCallbacks.forEach(cb => cb());
  }

  clear() {
    this.expiresAt = null;
    this.verified.set(false);
    this.secondsLeft.set(0);
    clearTimeout(this.expireTimer);
    clearInterval(this.countdownTimer);
  }

  formatRemaining(): string {
    const s = this.secondsLeft();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
