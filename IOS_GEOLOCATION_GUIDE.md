# 📱 Guide de Géolocalisation iOS

## Problème résolu

La géolocalisation sur iOS/Safari nécessite des configurations spécifiques qui ont été implémentées dans cette mise à jour.

## ✅ Modifications apportées

### 1. **Nouvelle bibliothèque de géolocalisation** (`src/lib/geolocation.ts`)
- Détection automatique iOS/Safari
- Timeouts optimisés pour iOS (10s au lieu de 15s)
- Messages d'erreur spécifiques avec instructions de déblocage
- Vérification HTTPS obligatoire pour iOS

### 2. **Composants mis à jour**
- `AddDoorForm.tsx` : Meilleure gestion des permissions GPS
- `MapView.tsx` : Support iOS amélioré pour la carte
- `index.html` : Méta tags PWA pour iOS

### 3. **Détection des erreurs iOS**
Les messages d'erreur incluent maintenant :
- **Permission refusée** → Instructions pour aller dans Réglages → Safari → Localisation
- **Position indisponible** → Vérifier que le GPS est activé
- **HTTPS requis** → Message si accès via HTTP

---

## 📋 Comment tester sur iPhone

### Méthode 1 : Via HTTPS (RECOMMANDÉ)

iOS Safari **exige HTTPS** pour la géolocalisation (sauf localhost). Voici comment :

#### Option A : Déployer sur Vercel/Netlify
```bash
# Déployer l'app
vercel --prod
# ou
netlify deploy --prod
```

Puis accédez via l'URL HTTPS fournie.

#### Option B : Utiliser un tunnel HTTPS local
```bash
# Installer ngrok
npm install -g ngrok

# Lancer l'app localement
npm run dev

# Dans un autre terminal, créer un tunnel HTTPS
ngrok http 8080
```

Utilisez l'URL HTTPS fournie par ngrok (ex: `https://abc123.ngrok.io`)

#### Option C : Certificat SSL local avec mkcert
```bash
# Installer mkcert
brew install mkcert
mkcert -install

# Créer un certificat local
mkcert localhost 127.0.0.1 ::1

# Modifier vite.config.ts pour utiliser HTTPS
```

### Méthode 2 : Via réseau local (peut ne pas fonctionner)

⚠️ **Attention** : iOS peut bloquer la géolocalisation sur les IPs locales non-HTTPS.

1. Trouvez votre IP locale (affichée par `npm run dev`)
   ```
   ➜ Network: http://192.168.0.19:8080/
   ```

2. Sur votre iPhone, accédez à `http://192.168.0.19:8080`

3. Si ça ne fonctionne pas, utilisez la Méthode 1.

---

## 🔧 Débloquer les permissions GPS sur iPhone

Si Safari a déjà refusé l'accès GPS, il faut **réinitialiser manuellement** :

### Pour Safari
1. **Réglages** (⚙️)
2. **Safari**
3. **Localisation**
4. Sélectionner **"Demander"** ou **"Autoriser"**

### Pour les services de localisation
1. **Réglages** (⚙️)
2. **Confidentialité et sécurité**
3. **Service de localisation**
4. Vérifier que c'est **Activé**
5. Descendre jusqu'à **Safari**
6. Sélectionner **"Lors de l'utilisation"**

### Réinitialiser toutes les autorisations
Si rien ne fonctionne :
1. **Réglages** → **Safari**
2. **Avancé** → **Données de sites web**
3. **Supprimer toutes les données**
4. Redémarrer Safari et réessayer

---

## 🧪 Test de diagnostic

Voici comment tester :

### 1. Vérifier HTTPS
```javascript
// Dans la console Safari (sur iPhone)
console.log('Secure context:', window.isSecureContext);
// Doit retourner "true" pour que GPS fonctionne
```

### 2. Tester la permission
Dans l'app, cliquez sur le bouton GPS (📍) :
- ✅ **Popup de permission Safari** → Normal, cliquez "Autoriser"
- ❌ **Erreur immédiate "Access denied"** → Permission déjà refusée, voir ci-dessus
- ❌ **"HTTPS requis"** → Utilisez une URL HTTPS

### 3. Messages d'erreur améliorés
Maintenant, les erreurs affichent :
```
Accès GPS refusé. Veuillez autoriser l'accès dans les réglages.

📱 Réglages → Safari → Localisation → Autoriser
```

---

## 🎯 Checklist de débogage

- [ ] L'URL commence par `https://` (pas `http://`)
- [ ] Services de localisation activés sur iPhone (Réglages → Confidentialité)
- [ ] Safari autorisé à utiliser la localisation
- [ ] Pas d'erreur de permission refusée précédemment (réinitialiser si besoin)
- [ ] Le bouton GPS est cliqué (action utilisateur requise)

---

## 📚 Ressources

- [MDN - Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Apple - Location Services](https://developer.apple.com/documentation/webkit/safari_web_extensions/requesting_permissions)
- [Can I Use - Geolocation](https://caniuse.com/geolocation)

---

## 💡 Astuce Pro

Pour un déploiement rapide sur HTTPS :
```bash
# 1. Build l'app
npm run build

# 2. Servir avec HTTPS local
npx serve dist -l 8080 --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem

# ou déployer en 30 secondes
vercel
```

---

**Dernière mise à jour** : 2025-12-01
