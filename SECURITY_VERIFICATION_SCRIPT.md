# 🔐 Script de Vérification de Sécurité - My Parisian Doors

Ce document contient tous les tests de sécurité à effectuer **AVANT** de déployer l'application en production.

---

## ✅ CHECKLIST RAPIDE

- [ ] RLS activé sur table `doors`
- [ ] Policies RLS fonctionnelles
- [ ] Storage bucket sécurisé
- [ ] Variables d'environnement protégées
- [ ] Console.logs retirés de production
- [ ] Validation des données activée
- [ ] Tests d'injection SQL
- [ ] Tests XSS
- [ ] Tests CSRF
- [ ] Tests d'authentification

---

## 🎯 ÉTAPE 1 : Vérifier la Configuration Supabase

### 1.1 Vérifier que RLS est activé

```sql
-- Exécuter dans Supabase SQL Editor
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'doors';

-- ✅ Résultat attendu: rowsecurity = true
-- ❌ Si false: Exécuter SUPABASE_RLS_SETUP.sql
```

### 1.2 Lister toutes les policies

```sql
-- Exécuter dans Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'doors'
ORDER BY policyname;

-- ✅ Résultat attendu: 4 policies
-- 1. Public doors are viewable by everyone (SELECT)
-- 2. Users can insert their own doors (INSERT)
-- 3. Users can update their own doors (UPDATE)
-- 4. Users can delete their own doors (DELETE)
```

### 1.3 Vérifier les user_id

```sql
-- Exécuter dans Supabase SQL Editor
SELECT
  COUNT(*) as total_doors,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as doors_with_user,
  COUNT(*) FILTER (WHERE user_id IS NULL) as doors_without_user
FROM doors;

-- ✅ Toutes les nouvelles portes doivent avoir user_id
-- ⚠️ Les anciennes portes peuvent avoir user_id NULL (c'est OK)
```

---

## 🧪 ÉTAPE 2 : Tests RLS Manuels

### Test 2.1 : Lecture publique (doit RÉUSSIR)

```bash
# Dans un terminal, sans authentification
curl -X GET \
  'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# ✅ Doit retourner la liste des portes (code 200)
```

### Test 2.2 : Insertion sans auth (doit ÉCHOUER)

```bash
# Dans un terminal, sans authentification
curl -X POST \
  'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Test Door",
    "neighborhood": "Test",
    "material": "Wood",
    "color": "Blue",
    "style": "Modern",
    "image_url": "https://example.com/test.jpg"
  }'

# ✅ Doit retourner une erreur (code 403 ou 401)
# ❌ Si code 201: RLS PAS ACTIVÉ - DANGER!
```

### Test 2.3 : Insertion avec auth (doit RÉUSSIR)

1. Ouvrir l'application web
2. Se connecter avec un compte
3. Ouvrir DevTools → Console
4. Copier le token JWT :

```javascript
// Dans la console du navigateur
const { data: { session } } = await supabase.auth.getSession();
console.log(session?.access_token);
```

5. Tester l'insertion avec ce token :

```bash
curl -X POST \
  'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Test Auth Door",
    "neighborhood": "Test",
    "material": "Wood",
    "color": "Blue",
    "style": "Modern",
    "image_url": "https://example.com/test.jpg",
    "user_id": "YOUR_USER_ID"
  }'

# ✅ Doit réussir (code 201)
```

### Test 2.4 : Modification de porte d'un autre user (doit ÉCHOUER)

```bash
# Avec le token de l'user A, essayer de modifier une porte de l'user B
curl -X PATCH \
  'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors?id=eq.DOOR_ID_OF_USER_B' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_A_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location": "Hacked!"}'

# ✅ Doit échouer (code 403)
# ❌ Si réussit: FAILLE DE SÉCURITÉ CRITIQUE!
```

---

## 📦 ÉTAPE 3 : Tests Storage

### Test 3.1 : Vérifier les policies Storage

1. Aller dans Supabase Dashboard → **Storage** → **Policies**
2. Sélectionner le bucket **door-images**
3. Vérifier qu'il y a 3 policies :
   - ✅ Public read access (SELECT)
   - ✅ Authenticated upload (INSERT)
   - ✅ Delete own images (DELETE)

### Test 3.2 : Upload sans auth (doit ÉCHOUER)

1. Se déconnecter de l'app
2. Essayer d'ajouter une porte
3. ✅ Doit afficher "Authentication Required"

### Test 3.3 : Upload avec auth (doit RÉUSSIR)

1. Se connecter
2. Ajouter une porte avec photo
3. ✅ L'upload doit réussir
4. Vérifier dans Storage → door-images que l'image apparaît

### Test 3.4 : Lecture publique d'image (doit RÉUSSIR)

1. Copier l'URL d'une image uploadée
2. Ouvrir l'URL en navigation privée (non connecté)
3. ✅ L'image doit s'afficher

---

## 🔒 ÉTAPE 4 : Tests de Validation

### Test 4.1 : Injection SQL

```javascript
// Dans la console du navigateur (connecté)
// Tenter d'injecter du SQL dans le champ location
const maliciousData = {
  location: "'; DROP TABLE doors; --",
  neighborhood: "Test",
  material: "Wood",
  color: "Blue",
  style: "Modern",
  imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  isFavorite: false
};

// Tenter d'ajouter via l'app
// ✅ Doit être bloqué par la validation Zod
// ✅ Supabase parameterized queries protègent contre SQL injection
```

### Test 4.2 : XSS (Cross-Site Scripting)

```javascript
// Tenter d'injecter du JavaScript dans la description
const xssData = {
  location: "Test XSS",
  neighborhood: "Test",
  material: "Wood",
  color: "Blue",
  style: "Modern",
  description: '<script>alert("XSS")</script>',
  imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  isFavorite: false
};

// ✅ Doit être sanitized par sanitizeHtml()
// ✅ Le script ne doit PAS s'exécuter
```

### Test 4.3 : Upload de fichier malveillant

```javascript
// Tenter d'uploader un fichier .exe ou .php déguisé en image
const maliciousFile = new File(
  ['<?php system($_GET["cmd"]); ?>'],
  'hack.jpg',
  { type: 'image/jpeg' }
);

// ✅ Doit être bloqué par validateImageFile()
// ✅ Vérification MIME type côté serveur
```

### Test 4.4 : Fichier trop volumineux

```javascript
// Tenter d'uploader une image > 10MB
// ✅ Doit être bloqué par validateImageFile()
// ✅ Message: "File is too large. Maximum size is 10MB."
```

---

## 🌐 ÉTAPE 5 : Tests CORS et Headers

### Test 5.1 : Vérifier les headers de sécurité

```bash
curl -I https://your-app.vercel.app

# ✅ Vérifier la présence de:
# - X-Frame-Options: DENY
# - X-Content-Type-Options: nosniff
# - Referrer-Policy: no-referrer
# - Permissions-Policy: geolocation=(self)
```

### Test 5.2 : CORS Protection

```bash
# Tenter d'accéder depuis un autre domaine
curl -X POST \
  'https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors' \
  -H "Origin: https://evil-site.com" \
  -H "apikey: YOUR_ANON_KEY"

# ✅ Doit échouer ou ignorer l'origin
```

---

## 🔐 ÉTAPE 6 : Tests d'Authentification

### Test 6.1 : Token JWT expiré

1. Se connecter
2. Copier le JWT token
3. Attendre l'expiration (ou modifier manuellement)
4. Tenter d'ajouter une porte avec le token expiré
5. ✅ Doit échouer avec error 401

### Test 6.2 : Token JWT falsifié

```javascript
// Modifier manuellement le payload du JWT
const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlLXVzZXIifQ.fakesignature";

// Tenter d'utiliser ce token
// ✅ Doit échouer (signature invalide)
```

### Test 6.3 : Session hijacking

1. User A se connecte → copier sessionId
2. User B essaie d'utiliser le sessionId de A
3. ✅ Doit échouer (Supabase protège contre ça)

---

## 📱 ÉTAPE 7 : Tests Spécifiques Mobile

### Test 7.1 : Permissions Caméra

1. Ouvrir l'app sur mobile
2. Refuser la permission caméra
3. ✅ L'app doit gérer gracieusement
4. ✅ Message d'erreur clair

### Test 7.2 : Permissions GPS

1. Refuser la permission GPS
2. ✅ Doit afficher un message clair
3. ✅ L'app continue de fonctionner (GPS optionnel)

---

## 🚨 ÉTAPE 8 : Tests de Rate Limiting

### Test 8.1 : Spam d'ajouts de portes

```javascript
// Tenter d'ajouter 100 portes rapidement
for (let i = 0; i < 100; i++) {
  await addDoor({...doorData, location: `Spam ${i}`});
}

// ⚠️ Actuellement PAS de rate limiting côté serveur
// 🔴 TODO: Ajouter rate limiting dans Supabase
```

### Test 8.2 : Spam de favoris

```javascript
// Tenter de toggle favorite 1000 fois
for (let i = 0; i < 1000; i++) {
  await toggleFavorite(doorId);
}

// ⚠️ Actuellement PAS de rate limiting
// 🔴 TODO: Ajouter throttling
```

---

## 🔍 ÉTAPE 9 : Audit des Logs

### Test 9.1 : Vérifier qu'aucun log sensible en production

```bash
# Build production
npm run build

# Chercher console.log dans le bundle
grep -r "console.log" dist/

# ✅ Ne doit trouver AUCUN console.log
# ✅ Logger conditionnel doit être actif
```

### Test 9.2 : Vérifier les logs Supabase

1. Aller dans Supabase Dashboard → **Logs**
2. Vérifier qu'il n'y a PAS de :
   - ❌ Passwords
   - ❌ JWT tokens complets
   - ❌ Données sensibles utilisateur

---

## 📊 RAPPORT DE SÉCURITÉ

### ✅ Tests Passés

- [ ] RLS activé
- [ ] Policies fonctionnelles
- [ ] Storage sécurisé
- [ ] Validation des données
- [ ] Sanitization XSS
- [ ] Protection injection SQL
- [ ] Authentification robuste
- [ ] Pas de console.log en prod
- [ ] Headers de sécurité OK

### ⚠️ Vulnérabilités Identifiées

- [ ] Rate limiting manquant (MEDIUM)
- [ ] CSRF tokens manquants (LOW)
- [ ] Content Security Policy manquante (MEDIUM)

### 🔴 Problèmes Critiques

- [ ] RLS non activé (CRITIQUE)
- [ ] Storage public sans policies (CRITIQUE)
- [ ] Validation désactivée (HAUTE)

---

## 🛠️ Actions Correctives

### Si RLS n'est PAS activé :

```bash
# URGENT: Exécuter immédiatement
# 1. Ouvrir Supabase SQL Editor
# 2. Exécuter SUPABASE_RLS_SETUP.sql
# 3. Vérifier avec les requêtes de test ci-dessus
```

### Si Storage n'est PAS sécurisé :

```bash
# 1. Suivre SUPABASE_STORAGE_SETUP.md
# 2. Créer les 3 policies requises
# 3. Tester avec les tests ci-dessus
```

### Si validation désactivée :

```bash
# 1. Vérifier que validation.ts est importé
# 2. Vérifier que validateNewDoor() est appelé
# 3. Tester avec données invalides
```

---

## 📞 Support

Si des tests échouent et que tu ne sais pas comment les corriger :

1. **Vérifier les logs** : Supabase Dashboard → Logs
2. **Vérifier la console** : Browser DevTools → Console
3. **Vérifier le code** : Comparer avec ce guide
4. **Demander de l'aide** : Supabase Discord / Support

---

## ✅ CERTIFICATION FINALE

Une fois TOUS les tests passés, cocher ici :

- [ ] **Tous les tests de sécurité sont VERTS**
- [ ] **Aucune vulnérabilité critique détectée**
- [ ] **L'application est prête pour la production**

**Date de vérification :** ___________
**Vérifié par :** ___________
**Signature :** ___________

---

**🔐 La sécurité est un processus continu. Re-vérifier après chaque mise à jour majeure !**
