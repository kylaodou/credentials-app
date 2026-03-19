import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-2 w-80 max-w-[calc(100vw-2rem)]">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div class="flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium"
          style="animation: slideIn 0.2s ease;"
          [style.background]="bg(toast.type)"
          [style.border]="border(toast.type)"
          [style.color]="color(toast.type)">
          <i [class]="icon(toast.type)" class="flex-shrink-0 mt-0.5"></i>
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastSvc.remove(toast.id)"
            style="background:none; border:none; cursor:pointer; opacity:0.6; padding:0; font-size:14px;"
            [style.color]="color(toast.type)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `],
})
export class ToastComponent {
  toastSvc = inject(ToastService);

  bg(type: string)     { return { success:'#F0FDF4', error:'#FEF2F2', warning:'#FFFBEB', info:'#EFF6FF' }[type] ?? '#fff'; }
  border(type: string) { return { success:'1px solid #BBF7D0', error:'1px solid #FECACA', warning:'1px solid #FDE68A', info:'1px solid #BFDBFE' }[type] ?? '1px solid #E2E8F0'; }
  color(type: string)  { return { success:'#15803D', error:'#DC2626', warning:'#B45309', info:'#1D4ED8' }[type] ?? '#374151'; }
  icon(type: string)   { return { success:'fa-solid fa-circle-check', error:'fa-solid fa-circle-xmark', warning:'fa-solid fa-triangle-exclamation', info:'fa-solid fa-circle-info' }[type] ?? 'fa-solid fa-circle-info'; }
}
