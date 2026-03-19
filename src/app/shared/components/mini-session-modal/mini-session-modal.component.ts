import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MiniSessionService } from '../../../core/services/mini-session.service';

@Component({
  selector: 'app-mini-session-modal',
  imports: [FormsModule],
  styleUrl: './mini-session-modal.component.css',
  templateUrl: './mini-session-modal.component.html',
})
export class MiniSessionModalComponent {
  // Injections en premier
  private authService    = inject(AuthService);
  private miniSessionSvc = inject(MiniSessionService);

  @Output() verified = new EventEmitter<void>();
  @Output() cancel   = new EventEmitter<void>();

  password = '';
  showPw   = signal(false);
  loading  = signal(false);
  error    = signal('');

  submit() {
    if (!this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.authService.verifyAppPassword(this.password).subscribe({
      next: () => {
        this.miniSessionSvc.grant();
        this.loading.set(false);
        this.verified.emit();
      },
      error: () => {
        this.error.set('Mot de passe incorrect');
        this.loading.set(false);
      },
    });
  }
}
