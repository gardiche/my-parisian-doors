# Configuration Google OAuth pour Supabase

## 📋 Guide complet de configuration

### Étape 1: Créer les credentials Google OAuth

1. **Aller sur Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Créer un nouveau projet (ou sélectionner un existant)**
   - Clique sur le menu déroulant en haut à gauche
   - "New Project"
   - Nom: "My Parisian Doors" (ou autre)
   - Créer

3. **Activer l'API Google+ API**
   - Menu hamburger > APIs & Services > Library
   - Rechercher "Google+ API"
   - Cliquer dessus et "Enable"

4. **Créer les credentials OAuth 2.0**
   - Menu hamburger > APIs & Services > Credentials
   - Cliquer sur "+ CREATE CREDENTIALS" > "OAuth client ID"

   **Si c'est la première fois:**
   - Il faudra d'abord configurer l'écran de consentement OAuth
   - Cliquer sur "CONFIGURE CONSENT SCREEN"
   - Choisir "External" > CREATE
   - Remplir les infos obligatoires:
     - App name: "My Parisian Doors"
     - User support email: ton email
     - Developer contact: ton email
   - SAVE AND CONTINUE
   - Scopes: laisser par défaut > SAVE AND CONTINUE
   - Test users: ajouter ton email de test > SAVE AND CONTINUE
   - Summary: BACK TO DASHBOARD

5. **Créer l'OAuth Client ID**
   - Retour sur Credentials
   - "+ CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: **Web application**
   - Name: "My Parisian Doors Web"

   **Authorized JavaScript origins:**
   ```
   https://<YOUR-PROJECT-REF>.supabase.co
   http://localhost:5173
   ```

   **Authorized redirect URIs:**
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```

   - Cliquer sur CREATE
   - **COPIER le Client ID et Client Secret** (garde-les ouverts)

---

### Étape 2: Configurer Supabase

1. **Aller dans ton projet Supabase**
   - URL: https://supabase.com/dashboard/project/<YOUR-PROJECT>

2. **Configuration Google Provider**
   - Menu de gauche > Authentication > Providers
   - Chercher "Google" dans la liste
   - Cliquer sur Google

3. **Activer et configurer Google**
   - **Enable Sign in with Google**: Activer le toggle

   - **Client ID (for OAuth)**: Coller le Client ID de Google

   - **Client Secret (for OAuth)**: Coller le Client Secret de Google

   - **Authorize Redirect URI**: Cette URL est déjà affichée, tu dois la copier et l'ajouter dans Google Console (déjà fait à l'étape 1)

   - Cliquer sur **SAVE**

---

### Étape 3: Récupérer l'URL de redirection Supabase

Dans Supabase, sous les paramètres Google, tu verras:
```
Callback URL (for OAuth):
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
```

Cette URL doit être dans les "Authorized redirect URIs" de Google Console (déjà fait si tu as suivi l'étape 1).

---

### Étape 4: Tester la configuration

1. **Vérifier les URLs autorisées dans Google Console**
   - Retourner sur Google Cloud Console > Credentials
   - Cliquer sur ton OAuth Client
   - Vérifier que les URLs sont correctes:
     ```
     Authorized JavaScript origins:
     - https://<YOUR-PROJECT-REF>.supabase.co
     - http://localhost:5173

     Authorized redirect URIs:
     - https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
     - http://localhost:5173/auth/callback
     ```

2. **Variables d'environnement** (déjà configurées normalement)
   - Vérifier que `.env` contient:
     ```env
     VITE_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
     VITE_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
     ```

3. **Tester en local**
   ```bash
   npm run dev
   ```
   - Effacer le localStorage (DevTools > Application > Local Storage > Clear All)
   - Recharger la page
   - Après l'animation Lottie, l'écran de signup devrait apparaître
   - Cliquer sur "Continue with Google"
   - Tu devrais voir le popup de connexion Google

---

## 🔧 Résumé des URLs importantes

### URLs à configurer dans Google Cloud Console:

**Authorized JavaScript origins:**
```
https://<YOUR-PROJECT-REF>.supabase.co
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
```

### Où trouver ton PROJECT-REF Supabase:
- C'est l'URL de ton projet Supabase
- Exemple: `https://abcdefghijklmnop.supabase.co`
- Le `abcdefghijklmnop` est ton PROJECT-REF

---

## ✅ Checklist finale

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth Client ID créé
- [ ] Client ID et Client Secret copiés
- [ ] Authorized JavaScript origins ajoutées dans Google Console
- [ ] Authorized redirect URIs ajoutées dans Google Console
- [ ] Google Provider activé dans Supabase
- [ ] Client ID configuré dans Supabase
- [ ] Client Secret configuré dans Supabase
- [ ] Variables d'environnement vérifiées
- [ ] Test en local effectué

---

## 🚨 Troubleshooting

### Erreur "redirect_uri_mismatch"
- Vérifier que l'URL de callback dans Google Console est exactement:
  `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
- Pas d'espace, pas de caractère en trop

### Le popup Google ne s'ouvre pas
- Vérifier que les "Authorized JavaScript origins" sont bien configurées
- Vérifier qu'il n'y a pas de bloqueur de popup dans le navigateur

### Erreur après la connexion Google
- Vérifier que l'utilisateur est bien créé dans Supabase (Authentication > Users)
- Vérifier les logs dans Supabase (Authentication > Logs)

### OAuth en production
- Quand tu déploieras (Vercel, Netlify, etc.), il faudra ajouter ton domaine de production dans:
  - Google Console > Authorized JavaScript origins: `https://mon-domaine.com`
  - Google Console > Authorized redirect URIs: `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`

---

## 📝 Notes importantes

1. **Écran de consentement**
   - En mode "External" + "Testing", seuls les emails ajoutés dans "Test users" pourront se connecter
   - Pour publier l'app, il faudra passer en mode "Production" (nécessite vérification Google)

2. **Sécurité**
   - Ne jamais commiter le Client Secret dans Git
   - Le Client Secret reste dans Supabase uniquement

3. **Redirection après login**
   - Actuellement configuré pour rediriger vers `window.location.origin`
   - L'utilisateur reviendra sur la page principale après connexion

4. **Gestion de session**
   - Supabase gère automatiquement la session après connexion Google
   - Tu peux récupérer l'utilisateur avec `supabase.auth.getUser()`
