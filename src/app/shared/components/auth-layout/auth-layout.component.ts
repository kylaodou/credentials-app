import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  imports: [],
  styleUrl: './auth-layout.component.scss',
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  @Input() heading = 'Gérez vos credentials en toute sécurité';
  @Input() subheading = 'Stockage chiffré, accès sécurisé, gestion simplifiée de vos mots de passe et tokens.';
}
