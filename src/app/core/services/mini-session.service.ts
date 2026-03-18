import { Injectable, signal } from '@angular/core';

const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes en ms

@Injectable({ providedIn: 'root' })
export class MiniSessionService {
  verified = signal(false);
  private expiresAt: number | null = null;
  private timer: any;

  isValid(): boolean {
    if (!this.expiresAt) return false;
    if (Date.now() > this.expiresAt) {
      this.clear();
      return false;
    }
    return true;
  }

  grant() {
    this.expiresAt = Date.now() + SESSION_DURATION;
    this.verified.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.clear(), SESSION_DURATION);
  }

  clear() {
    this.expiresAt = null;
    this.verified.set(false);
    clearTimeout(this.timer);
  }

  remainingSeconds(): number {
    if (!this.expiresAt) return 0;
    return Math.max(0, Math.round((this.expiresAt - Date.now()) / 1000));
  }
}
