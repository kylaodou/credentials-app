import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  styleUrl: './confirm-modal.component.css',
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() title        = 'Confirmation';
  @Input() message      = 'Êtes-vous sûr ?';
  @Input() confirmLabel = 'Confirmer';
  @Input() danger       = false;
  @Output() confirm     = new EventEmitter<void>();
  @Output() cancel      = new EventEmitter<void>();
}
