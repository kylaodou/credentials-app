import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh; background:#F8FAFF; font-family:'Plus Jakarta Sans',sans-serif;">

      <!-- Header -->
      <header style="background:#fff; border-bottom:1px solid #E2E8F0; padding:16px 0;">
        <div style="max-width:760px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="/img/logo.jpg" style="width:28px; height:28px; border-radius:5px;" />
            <span style="font-weight:700; font-size:15px; color:#0F172A;">Credential App</span>
          </div>
          <a routerLink="/login" style="font-size:13px; color:#2563EB; text-decoration:none; font-weight:500;">
            ← Retour à la connexion
          </a>
        </div>
      </header>

      <!-- Content -->
      <main style="max-width:760px; margin:0 auto; padding:48px 24px;">

        <h1 style="font-size:28px; font-weight:800; color:#0F172A; margin-bottom:8px;">
          Politique de confidentialité
        </h1>
        <p style="font-size:13px; color:#94A3B8; margin-bottom:40px;">
          Dernière mise à jour : {{ today }}
        </p>

        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:32px; line-height:1.8;">

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">1. Introduction</h2>
            <p style="font-size:14px; color:#374151;">
              Credential App est une application personnelle de gestion de credentials (mots de passe, tokens, identifiants).
              Cette politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">2. Données collectées</h2>
            <p style="font-size:14px; color:#374151; margin-bottom:8px;">Lors de l'utilisation de l'application, nous collectons :</p>
            <ul style="font-size:14px; color:#374151; padding-left:20px;">
              <li style="margin-bottom:6px;"><strong>Données Google OAuth</strong> : nom, adresse email et photo de profil fournis par Google lors de la connexion.</li>
              <li style="margin-bottom:6px;"><strong>Credentials</strong> : les données que vous saisissez (noms, URLs, descriptions). Les données sensibles (mots de passe, tokens, usernames) sont chiffrées en AES-256 avant stockage.</li>
              <li style="margin-bottom:6px;"><strong>Mot de passe applicatif</strong> : haché avec bcrypt, jamais stocké en clair.</li>
            </ul>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">3. Utilisation des données</h2>
            <p style="font-size:14px; color:#374151; margin-bottom:8px;">Vos données sont utilisées uniquement pour :</p>
            <ul style="font-size:14px; color:#374151; padding-left:20px;">
              <li style="margin-bottom:6px;">Vous authentifier via Google OAuth</li>
              <li style="margin-bottom:6px;">Stocker et gérer vos credentials de manière sécurisée</li>
              <li style="margin-bottom:6px;">Vous envoyer des emails transactionnels (bienvenue, code OTP)</li>
            </ul>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">4. Sécurité des données</h2>
            <p style="font-size:14px; color:#374151;">
              Toutes les données sensibles sont chiffrées avec AES-256-CBC via la clé d'application Laravel.
              L'accès aux données déchiffrées nécessite une vérification par mot de passe applicatif (mini-session de 5 minutes).
              Les communications sont sécurisées via HTTPS.
            </p>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">5. Partage des données</h2>
            <p style="font-size:14px; color:#374151;">
              Vos données ne sont <strong>jamais vendues, partagées ou transmises</strong> à des tiers.
              L'application est à usage personnel uniquement.
            </p>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">6. Authentification Google</h2>
            <p style="font-size:14px; color:#374151;">
              Nous utilisons Google OAuth 2.0 pour l'authentification. Nous accédons uniquement à votre nom, email et photo de profil.
              Nous ne stockons pas votre mot de passe Google. Pour plus d'informations sur la politique de confidentialité de Google :
              <a href="https://policies.google.com/privacy" target="_blank" style="color:#2563EB;">policies.google.com/privacy</a>
            </p>
          </section>

          <section style="margin-bottom:32px;">
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">7. Vos droits</h2>
            <p style="font-size:14px; color:#374151; margin-bottom:8px;">Vous avez le droit de :</p>
            <ul style="font-size:14px; color:#374151; padding-left:20px;">
              <li style="margin-bottom:6px;">Accéder à vos données personnelles</li>
              <li style="margin-bottom:6px;">Supprimer votre compte et toutes vos données</li>
              <li style="margin-bottom:6px;">Modifier vos informations à tout moment</li>
            </ul>
          </section>

          <section>
            <h2 style="font-size:17px; font-weight:700; color:#0F172A; margin-bottom:12px;">8. Contact</h2>
            <p style="font-size:14px; color:#374151;">
              Pour toute question concernant cette politique de confidentialité, contactez-nous à :
              <a href="mailto:kylaodouothniela@gmail.com" style="color:#2563EB;">kylaodouothniela@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      <footer style="text-align:center; padding:24px; font-size:12px; color:#CBD5E1;">
        © {{ year }} Credential App
      </footer>
    </div>
  `,
})
export class PrivacyComponent {
  today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  year  = new Date().getFullYear();
}
