# 🚀 Guide de Déploiement Sécurisé - My Parisian Doors

**Guide étape par étape pour déployer l'application en production de manière sécurisée.**

---

## ⚡ QUICK START (15 minutes)

Si tu veux déployer RAPIDEMENT avec sécurité de base :

```bash
# 1. Exécuter le SQL RLS dans Supabase
# Dashboard > SQL Editor > Coller SUPABASE_RLS_SETUP.sql > Run

# 2. Configurer Storage
# Suivre SUPABASE_STORAGE_SETUP.md (via UI)

# 3. Build et déployer
npm run build
vercel --prod

# 4. Configurer variables d'env sur Vercel
# Dashboard > Settings > Environment Variables
# VITE_SUPABASE_URL=xxx
# VITE_SUPABASE_ANON_KEY=xxx

# 5. Tester
# Exécuter 5 premiers tests de SECURITY_VERIFICATION_SCRIPT.md
```

✅ **Tu es prêt pour une beta !**

---

## 📋 DÉPLOIEMENT COMPLET (2-3 heures)

### Étape 1 : Préparation Supabase (30 min)

#### 1.1 Vérifier la base de données

```sql
-- Dans Supabase SQL Editor
-- Vérifier que la table existe
SELECT * FROM doors LIMIT 1;

-- Vérifier les colonnes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'doors';
```

**Colonnes requises :**
- ✅ `id` (uuid)
- ✅ `user_id` (uuid) ← CRITIQUE
- ✅ `image_url` (text)
- ✅ `location` (text)
- ✅ `neighborhood` (text)
- ✅ `material`, `color`, `style`
- ✅ `is_favorite` (boolean)
- ✅ `coordinates` (jsonb)

#### 1.2 Activer RLS

```bash
# Ouvrir SUPABASE_RLS_SETUP.sql
# Copier TOUT le contenu
# Coller dans Supabase SQL Editor
# Cliquer sur "Run" (Ctrl+Enter)
```

**Vérification :**
```sql
-- Doit retourner rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'doors';
```

#### 1.3 Configurer Storage

**Via Supabase Dashboard :**

1. Aller dans **Storage**
2. Créer bucket `door-images` (si n'existe pas)
3. Cocher **Public bucket**
4. Aller dans **Policies**
5. Créer 3 policies (voir SUPABASE_STORAGE_SETUP.md)

**Tester :**
```bash
# Upload test
curl -X POST \
  'https://cxvikvquxfzaxmcffszr.supabase.co/storage/v1/object/door-images/test.jpg' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  --data-binary '@test.jpg'

# ✅ Doit réussir avec auth
# ❌ Doit échouer sans auth
```

#### 1.4 Configurer Authentication

**Dashboard > Authentication > Settings :**

1. **Email confirmations :** ✅ Activé
2. **Email templates :** Personnaliser (optionnel)
3. **Google OAuth :** Suivre SUPABASE_GOOGLE_AUTH_SETUP.md
4. **Redirect URLs :** Ajouter ton domaine de prod

```
https://your-app.vercel.app/**
https://your-app.com/**
```

---

### Étape 2 : Configuration du Code (15 min)

#### 2.1 Vérifier les imports

```bash
# Chercher les console.log restants
grep -r "console\\.log\\|console\\.warn" src/

# ✅ Doit être vide (ou que dans logger.ts)
```

#### 2.2 Vérifier la validation

```typescript
// Dans src/lib/supabase.ts
// Vérifier que cette ligne existe :
const validation = validateNewDoor(door)
```

#### 2.3 Build de test

```bash
# Build local
npm run build

# Vérifier la taille
du -sh dist/

# ✅ Doit être < 2-3 MB idéalement
```

#### 2.4 Tester le build

```bash
# Servir le build localement
npm run preview

# Ouvrir http://localhost:4173
# Tester :
# 1. Sign up
# 2. Add door
# 3. Favorite
# 4. Map view
```

---

### Étape 3 : Déploiement Vercel (20 min)

#### 3.1 Installer Vercel CLI

```bash
npm i -g vercel
```

#### 3.2 Premier déploiement

```bash
# Login
vercel login

# Déployer en preview
vercel

# Suivre les prompts :
# - Link to existing project? No
# - Project name: my-parisian-doors
# - Directory: ./
# - Override settings? No
```

#### 3.3 Configurer les variables d'environnement

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL
# Coller : https://cxvikvquxfzaxmcffszr.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Coller : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ou via Dashboard
# vercel.com > Project > Settings > Environment Variables
```

**Important :** Ajouter pour **Production**, **Preview**, **Development**

#### 3.4 Déployer en production

```bash
vercel --prod
```

**Récupérer l'URL :**
```
✅ Production: https://my-parisian-doors.vercel.app
```

#### 3.5 Configurer le domaine custom (optionnel)

```bash
# Via Dashboard
# Vercel > Settings > Domains > Add Domain
# Exemple : myparisiandoors.com

# Ajouter DNS records chez ton registrar
```

---

### Étape 4 : Configuration Sécurité Vercel (10 min)

#### 4.1 Créer `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(self), camera=(self)"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 4.2 Re-déployer

```bash
git add vercel.json
git commit -m "Add security headers"
git push
vercel --prod
```

#### 4.3 Vérifier les headers

```bash
curl -I https://your-app.vercel.app

# Doit contenir :
# x-frame-options: DENY
# x-content-type-options: nosniff
# etc.
```

---

### Étape 5 : Mise à jour Supabase (5 min)

#### 5.1 Ajouter l'URL de prod aux redirects

**Dashboard > Authentication > URL Configuration :**

```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app/**
  - http://localhost:5173/** (dev)
  - http://localhost:4173/** (preview)
```

#### 5.2 Tester OAuth en prod

1. Ouvrir https://your-app.vercel.app
2. Cliquer "Sign in with Google"
3. ✅ Doit rediriger correctement

---

### Étape 6 : Tests de Sécurité (30 min)

**Suivre :** `SECURITY_VERIFICATION_SCRIPT.md`

#### Tests critiques minimum :

```bash
# Test 1 : RLS activé
curl https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors?select=*
# ✅ Doit retourner des données (lecture publique)

# Test 2 : Insertion sans auth
curl -X POST https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors \
  -d '{"location":"test"}'
# ❌ Doit échouer (403)

# Test 3 : Upload image
# Dans l'app, se connecter et ajouter une porte
# ✅ Doit réussir

# Test 4 : Voir image en navigation privée
# Copier URL image, ouvrir en incognito
# ✅ Image doit s'afficher

# Test 5 : Modifier porte d'un autre user
# Se connecter avec User A
# Essayer de modifier porte de User B via API
# ❌ Doit échouer
```

**Si un test échoue → NE PAS CONTINUER**

---

### Étape 7 : Monitoring & Analytics (30 min)

#### 7.1 Configurer Sentry (erreurs)

```bash
npm install @sentry/react

# Créer compte sur sentry.io
# Récupérer DSN

# Ajouter dans src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

**Ajouter DSN en variable d'env :**
```bash
vercel env add VITE_SENTRY_DSN
```

#### 7.2 Intégrer dans logger.ts

```typescript
// Dans src/lib/logger.ts
error(message: string, error?: Error | unknown, context?: LogContext): void {
  // ... existing code ...

  // En production, envoyer à Sentry
  if (isProduction && error) {
    Sentry.captureException(error, { extra: context });
  }
}
```

#### 7.3 Configurer Analytics

**Option A : Plausible (privacy-friendly)**
```html
<!-- Dans index.html -->
<script defer data-domain="your-app.vercel.app"
  src="https://plausible.io/js/script.js"></script>
```

**Option B : Google Analytics 4**
```bash
npm install react-ga4
```

---

### Étape 8 : Documentation Utilisateur (15 min)

#### 8.1 Mettre à jour README.md

```markdown
# My Parisian Doors

## 🌐 Application Live

**Production :** https://your-app.vercel.app

## 🔐 Sécurité

Cette application utilise :
- Supabase Authentication
- Row Level Security (RLS)
- Validation des données avec Zod
- HTTPS obligatoire

Voir [SECURITY_MEASURES.md](./SECURITY_MEASURES.md) pour plus de détails.
```

#### 8.2 Créer PRIVACY_POLICY.md

**Obligatoire pour les stores :**

```markdown
# Privacy Policy

Last updated: [DATE]

## Data Collection

We collect:
- Email address (for authentication)
- Photos of doors (uploaded by you)
- GPS coordinates (with your permission)
- Location data (addresses you enter)

## Data Usage

Your data is used to:
- Display your door collection
- Share doors with other users
- Provide map functionality

## Data Storage

Data is stored on Supabase servers (EU region).

## Your Rights

You can:
- Delete your account
- Export your data
- Request data deletion

Contact: privacy@myparisiandoors.com
```

#### 8.3 Créer TERMS_OF_SERVICE.md

```markdown
# Terms of Service

## Acceptable Use

You agree not to:
- Upload illegal content
- Spam the service
- Attempt to hack or exploit

## Content Ownership

- You own the photos you upload
- You grant us license to display them

## Liability

Service provided "as is" without warranty.
```

---

### Étape 9 : Backup & Disaster Recovery (10 min)

#### 9.1 Configurer backups Supabase

**Dashboard > Database > Backups :**
- ✅ Point-in-time recovery activé (plan payant)
- ✅ Daily backups (gratuit)

#### 9.2 Export manuel

```bash
# Exporter toutes les portes
curl 'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors?select=*' \
  -H "apikey: YOUR_KEY" > backup_doors.json

# Sauvegarder régulièrement (cron job)
```

#### 9.3 Plan de récupération

**Si base de données corrompue :**
1. Restaurer depuis backup Supabase
2. Re-importer données si nécessaire
3. Vérifier intégrité

**Si Storage corrompu :**
1. Les URLs publiques restent accessibles
2. Re-uploader si nécessaire

---

### Étape 10 : Lancement Final (15 min)

#### 10.1 Checklist pré-lancement

- [ ] **Build production** : Sans warnings
- [ ] **Tests sécurité** : Tous verts
- [ ] **Variables d'env** : Configurées sur Vercel
- [ ] **RLS** : Activé et testé
- [ ] **Storage** : Policies actives
- [ ] **Monitoring** : Sentry configuré
- [ ] **Analytics** : Actif
- [ ] **Legal docs** : Privacy + Terms
- [ ] **Domaine** : Configuré (si custom)
- [ ] **SSL** : Actif (auto avec Vercel)

#### 10.2 Smoke test final

```bash
# Test complet en production
# 1. Sign up nouveau compte
# 2. Ajouter 3 portes
# 3. Favorite 1 porte
# 4. Voir sur map
# 5. Se déconnecter
# 6. Voir portes publiquement
# 7. Impossible d'ajouter porte
# 8. Se reconnecter
# 9. Supprimer 1 porte
# 10. Vérifier stockage

# ✅ Tout doit fonctionner parfaitement
```

#### 10.3 Monitoring post-lancement

**Première semaine :**
- Vérifier Sentry quotidiennement
- Vérifier logs Supabase
- Surveiller usage Storage
- Répondre aux bugs rapidement

**Premier mois :**
- Analyser métriques
- Corriger bugs prioritaires
- Optimiser performance

---

## 🚨 ROLLBACK EN CAS DE PROBLÈME

### Si bug critique en production :

```bash
# 1. Identifier le commit stable
git log --oneline

# 2. Revenir en arrière
git revert <commit-hash>

# 3. Re-déployer
vercel --prod

# 4. Vérifier que ça fonctionne
```

### Si Supabase inaccessible :

1. Vérifier status : https://status.supabase.com
2. Activer mode maintenance
3. Communiquer aux users
4. Attendre résolution

---

## 📞 SUPPORT POST-DÉPLOIEMENT

### Ressources

- **Vercel Docs :** https://vercel.com/docs
- **Supabase Docs :** https://supabase.com/docs
- **Sentry Docs :** https://docs.sentry.io

### Communauté

- **Supabase Discord :** https://discord.supabase.com
- **Vercel Discord :** https://vercel.com/discord

### Obtenir de l'aide

1. Vérifier logs (Sentry, Vercel, Supabase)
2. Chercher dans docs
3. Demander sur Discord
4. Ouvrir issue GitHub (si open source)

---

## ✅ DÉPLOIEMENT RÉUSSI !

**Félicitations ! Ton application est en production.**

**Prochaines étapes :**
1. 📱 Préparer pour app stores (Capacitor)
2. 🌍 Ajouter i18n (multi-langues)
3. 📊 Ajouter analytics avancés
4. 🎨 Améliorer UI/UX
5. 🚀 Marketing !

---

**Date de déploiement :** ___________
**Déployé par :** ___________
**URL de production :** ___________

🎉 **Enjoy your secure Parisian Doors app!**
