# 🚀 Déploiement Vercel - My Parisian Doors

## ✅ Déploiement Réussi !

Votre application a été déployée sur Vercel :

**Production URL:** https://parisiandoors-rw4wjbvr0-thomas-projects-4f57d4e8.vercel.app

---

## ⚠️ ÉTAPE CRITIQUE : Configurer les Variables d'Environnement

**🚨 L'application NE FONCTIONNERA PAS sans les variables d'environnement !**

### Méthode 1 : Via le Dashboard Vercel (Recommandé)

1. **Aller sur le Dashboard Vercel**
   ```
   https://vercel.com/thomas-projects-4f57d4e8/parisiandoors
   ```

2. **Naviguer vers Settings → Environment Variables**
   - Cliquer sur votre projet "parisiandoors"
   - Onglet **"Settings"**
   - Section **"Environment Variables"**

3. **Ajouter les 2 variables :**

   **Variable 1 :**
   ```
   Name: VITE_SUPABASE_URL
   Value: https://cxvikvquxfzaxmcffszr.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **Variable 2 :**
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dmlrdnF1eGZ6YXhtY2Zmc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzM4MDksImV4cCI6MjA3NTAwOTgwOX0.5ol0xUAX8KVJFVT_JCtbSMTHi9sj7EnbXuWF5nnNByE
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. **Sauvegarder** et **Redéployer**
   - Cliquer sur **"Save"** pour chaque variable
   - Vercel va automatiquement redéployer

---

### Méthode 2 : Via CLI Vercel

```bash
# Ajouter les variables d'environnement via CLI
vercel env add VITE_SUPABASE_URL production
# Entrer: https://cxvikvquxfzaxmcffszr.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Entrer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dmlrdnF1eGZ6YXhtY2Zmc3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzM4MDksImV4cCI6MjA3NTAwOTgwOX0.5ol0xUAX8KVJFVT_JCtbSMTHi9sj7EnbXuWF5nnNByE

# Redéployer
vercel --prod
```

---

## 🔗 URLs Importantes

### Production
- **App URL:** https://parisiandoors-rw4wjbvr0-thomas-projects-4f57d4e8.vercel.app
- **Vercel Dashboard:** https://vercel.com/thomas-projects-4f57d4e8/parisiandoors

### Logs & Monitoring
- **Logs en temps réel:** https://vercel.com/thomas-projects-4f57d4e8/parisiandoors/wVamRVbqv5rqzYEBJGh5YtZjR95Q
- **Inspect Deployment:** Aller dans Vercel Dashboard → Deployments → Cliquer sur le dernier

---

## ✅ Checklist Post-Déploiement

### 1. Variables d'Environnement
- [ ] `VITE_SUPABASE_URL` ajoutée
- [ ] `VITE_SUPABASE_ANON_KEY` ajoutée
- [ ] Redéploiement effectué après ajout des variables

### 2. Test de l'Application
- [ ] Ouvrir l'URL de production
- [ ] Vérifier que l'animation de splash fonctionne
- [ ] Vérifier que SignUp apparaît
- [ ] S'inscrire avec un nouveau compte
- [ ] Ajouter une porte avec image
- [ ] Vérifier que l'upload fonctionne
- [ ] Vérifier MyDoors
- [ ] Vérifier la carte

### 3. Supabase Configuration
- [ ] Ajouter l'URL Vercel dans les redirections OAuth Google (si configuré)
  ```
  Authorized JavaScript origins:
  https://parisiandoors-rw4wjbvr0-thomas-projects-4f57d4e8.vercel.app

  Authorized redirect URIs:
  https://cxvikvquxfzaxmcffszr.supabase.co/auth/v1/callback
  ```

### 4. Vérifier les Storage Policies
- [ ] Storage policies configurées (voir SUPABASE_STORAGE_SETUP.md)
- [ ] Upload d'images fonctionne en production
- [ ] Images chargent correctement

---

## 🔄 Commandes Utiles

### Voir les logs en temps réel
```bash
vercel logs parisiandoors-rw4wjbvr0-thomas-projects-4f57d4e8.vercel.app
```

### Redéployer
```bash
vercel --prod
```

### Voir les variables d'environnement
```bash
vercel env ls
```

### Rollback vers un déploiement précédent
```bash
# Aller dans Dashboard → Deployments → Promote to Production
```

---

## 🐛 Troubleshooting

### Erreur: "Missing Supabase environment variables"

**Cause:** Variables d'environnement non configurées

**Solution:**
1. Aller dans Vercel Dashboard → Settings → Environment Variables
2. Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Redéployer l'application

### Page blanche / Rien ne s'affiche

**Solutions:**
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs
3. Vérifier les variables d'environnement
4. Vérifier les logs Vercel

### Images ne chargent pas

**Solutions:**
1. Vérifier Storage policies dans Supabase
2. Vérifier que le bucket est public
3. Tester l'URL d'une image directement

### OAuth Google ne fonctionne pas

**Solutions:**
1. Ajouter l'URL Vercel dans Google Console:
   - Authorized JavaScript origins
   - Authorized redirect URIs
2. Vérifier les credentials dans Supabase

---

## 📱 Domaine Personnalisé (Optionnel)

Pour utiliser votre propre domaine (ex: myparisiandoors.com):

1. **Vercel Dashboard** → **Settings** → **Domains**
2. Cliquer sur **"Add Domain"**
3. Entrer votre domaine
4. Suivre les instructions DNS
5. Attendre la propagation (5-10 minutes)

Une fois configuré, mettre à jour dans Google OAuth Console si nécessaire.

---

## 🎉 C'est Déployé !

Votre application est maintenant en ligne et accessible à tous !

**Prochaines étapes recommandées:**
1. ✅ Ajouter les variables d'environnement (CRITIQUE)
2. ✅ Tester l'application en production
3. ✅ Configurer Storage policies (si pas encore fait)
4. ✅ Partager le lien avec vos premiers utilisateurs !

---

**URL de production:** https://parisiandoors-rw4wjbvr0-thomas-projects-4f57d4e8.vercel.app
