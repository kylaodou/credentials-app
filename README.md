# Credential App — Interface web

Application web (PWA) d'un coffre-fort personnel d'identifiants : on y enregistre ses comptes,
mots de passe, jetons et liens, et on ne les affiche en clair qu'après confirmation de son mot de
passe.

Elle consomme l'API [`credentials-app-back`](https://github.com/kylaodou/credentials-app-back).

## Fonctionnalités

- Connexion avec Google, puis définition d'un mot de passe propre à l'application.
- Mot de passe oublié avec code OTP reçu par e-mail.
- Tableau de bord des identifiants.
- Liste, création, modification, détail et suppression des identifiants (avec confirmation).
- Affichage en clair d'un secret uniquement après vérification du mot de passe.
- Session courte : une fenêtre de reconnexion apparaît quand la session expire.
- Profil utilisateur, page de politique de confidentialité.
- Installable comme une application (PWA), notifications sous forme de toasts.

## Stack technique

- Angular 21 (composants standalone)
- Tailwind CSS 4
- Service Worker Angular

## Prérequis

- Node.js 20+ et npm
- Angular CLI 21 : `npm install -g @angular/cli`
- L'API `credentials-app-back` lancée

## Installation et lancement

```bash
git clone https://github.com/kylaodou/credentials-app.git
cd credentials-app
npm install
npm start
```

L'application est disponible sur http://localhost:4200.

## Configuration

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  googleRedirectUrl: 'http://localhost:8000/api/auth/google/redirect',
};
```

`environment.prod.ts` contient les URLs de l'API en production.

## Build de production

```bash
npm run build
```

## Tests

```bash
npm test
```

## Auteur

[@kylaodou](https://github.com/kylaodou)
