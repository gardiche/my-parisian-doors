# ⏱️ Options de Rate Limiting - My Parisian Doors

Ce guide présente toutes les solutions pour implémenter le rate limiting et protéger ton app contre le spam et les abus.

---

## 🎯 POURQUOI LE RATE LIMITING ?

### Problèmes actuels

Sans rate limiting, un user malveillant peut :
- ❌ Uploader 1000 portes en 1 minute
- ❌ Toggle favorite 10000 fois/seconde
- ❌ Spammer la géolocalisation
- ❌ Saturer le storage (10MB × 1000 = 10GB)
- ❌ Faire exploser les coûts Supabase

### Objectifs

- ✅ Max 10 uploads par heure par user
- ✅ Max 100 requêtes API par minute
- ✅ Max 5 requêtes géolocalisation par minute
- ✅ Bloquer spam automatique

---

## 🔧 OPTION 1 : SUPABASE POSTGRES FUNCTIONS (GRATUIT)

**Difficulté :** 🟢 Facile
**Coût :** Gratuit
**Performance :** Excellente
**Recommandé pour :** Production

### Comment ça marche

Utiliser une fonction PostgreSQL pour compter les opérations récentes.

### Implémentation

#### 1. Créer la fonction

```sql
-- Dans Supabase SQL Editor
CREATE OR REPLACE FUNCTION check_door_rate_limit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Compter les portes ajoutées dans la dernière heure
  SELECT COUNT(*) INTO recent_count
  FROM doors
  WHERE user_id = user_uuid
  AND date_added > NOW() - INTERVAL '1 hour';

  -- Retourner true si sous la limite
  RETURN recent_count < 10; -- Max 10 doors/heure
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. Créer une table de logs (optionnel)

```sql
CREATE TABLE rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_rate_limit_user_time
ON rate_limit_logs(user_id, created_at DESC);
```

#### 3. Modifier la policy INSERT

```sql
-- Remplacer la policy existante
DROP POLICY IF EXISTS "Users can insert their own doors" ON doors;

CREATE POLICY "Users can insert their own doors"
ON doors FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND check_door_rate_limit(auth.uid())
);
```

#### 4. Gérer l'erreur côté client

```typescript
// src/lib/supabase.ts
export async function addDoor(door: Omit<Door, 'id'>): Promise<Door | null> {
  // ... existing validation ...

  const { data, error } = await supabase
    .from('doors')
    .insert([...])

  if (error) {
    // Détecter erreur rate limit
    if (error.message.includes('check_door_rate_limit')) {
      logger.warn('Rate limit exceeded for user')
      throw new Error('You can only add 10 doors per hour. Please try again later.')
    }

    logger.error('Error inserting door', error)
    return null
  }

  return data
}
```

### ✅ Avantages

- Gratuit
- Intégré à Supabase
- Performance native
- Pas de service externe

### ❌ Inconvénients

- Limité aux opérations DB
- Pas de rate limiting sur Storage uploads
- Moins flexible

---

## 🔧 OPTION 2 : UPSTASH REDIS (RECOMMANDÉ)

**Difficulté :** 🟡 Moyenne
**Coût :** Gratuit jusqu'à 10k requêtes/jour
**Performance :** Excellente
**Recommandé pour :** Production à grande échelle

### Comment ça marche

Upstash est un service Redis serverless qui compte les requêtes en mémoire ultra-rapide.

### Implémentation

#### 1. Créer compte Upstash

1. Aller sur https://upstash.com
2. Sign up (gratuit)
3. Créer une base Redis
4. Récupérer `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`

#### 2. Installer le package

```bash
npm install @upstash/ratelimit @upstash/redis
```

#### 3. Créer le rate limiter

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
})

// Rate limiter pour ajouter des portes
export const doorUploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requêtes par heure
  analytics: true,
  prefix: 'door_upload',
})

// Rate limiter pour favoris
export const favoriteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requêtes par minute
  analytics: true,
  prefix: 'favorite',
})

// Rate limiter pour géolocalisation
export const geoLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requêtes par minute
  analytics: true,
  prefix: 'geo',
})

// Rate limiter global (anti-spam)
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '10 s'), // 100 requêtes par 10s
  analytics: true,
  prefix: 'global',
})
```

#### 4. Utiliser dans le code

```typescript
// src/lib/supabase.ts
import { doorUploadLimiter } from '@/lib/ratelimit'

export async function addDoor(door: Omit<Door, 'id'>): Promise<Door | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // CHECK RATE LIMIT
  const { success, limit, remaining, reset } = await doorUploadLimiter.limit(user.id)

  if (!success) {
    const resetDate = new Date(reset)
    logger.warn('Rate limit exceeded', { userId: user.id, reset: resetDate })
    throw new Error(
      `Rate limit exceeded. You can upload ${remaining} more doors. ` +
      `Limit resets at ${resetDate.toLocaleTimeString()}`
    )
  }

  // ... reste du code ...
}
```

#### 5. Ajouter UI feedback

```typescript
// src/components/AddDoorForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    await onAddDoor(newDoor)
    // Success
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      toast.error(error.message, {
        duration: 5000,
      })
    } else {
      toast.error('Error adding door')
    }
  }
}
```

### ✅ Avantages

- Très performant (Redis in-memory)
- Flexible (différents limiters)
- Analytics inclus
- Serverless (pas de serveur à gérer)
- Gratuit jusqu'à 10k req/jour

### ❌ Inconvénients

- Service externe
- Variables d'env supplémentaires
- Coût si > 10k req/jour

---

## 🔧 OPTION 3 : VERCEL EDGE MIDDLEWARE

**Difficulté :** 🔴 Difficile
**Coût :** Gratuit (inclus Vercel)
**Performance :** Excellente
**Recommandé pour :** Apps Vercel uniquement

### Comment ça marche

Utiliser Edge Functions Vercel pour bloquer les requêtes AVANT qu'elles atteignent ton app.

### Implémentation

#### 1. Installer @vercel/edge

```bash
npm install @vercel/edge
```

#### 2. Créer middleware

```typescript
// middleware.ts (à la racine)
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

⚠️ **PROBLÈME :** Votre app est Vite/React (pas Next.js), donc cette option ne fonctionne PAS directement.

**Alternative :** Créer des Vercel Edge Functions pour les endpoints critiques.

### ✅ Avantages

- Protection au niveau Edge (très rapide)
- Inclus avec Vercel

### ❌ Inconvénients

- Nécessite Next.js OU migration vers Edge Functions
- Complexe pour app Vite/React

---

## 🔧 OPTION 4 : CLIENT-SIDE ONLY (PAS RECOMMANDÉ)

**Difficulté :** 🟢 Facile
**Coût :** Gratuit
**Performance :** Bonne
**Recommandé pour :** DEV uniquement, PAS PRODUCTION

### Comment ça marche

Utiliser localStorage pour compter les requêtes côté client.

### Implémentation

```typescript
// src/lib/clientRateLimit.ts
interface RateLimitEntry {
  count: number
  resetTime: number
}

export function checkClientRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 3600000 // 1 heure
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const storageKey = `ratelimit_${key}`

  const stored = localStorage.getItem(storageKey)
  let entry: RateLimitEntry

  if (stored) {
    entry = JSON.parse(stored)

    // Reset si window expirée
    if (now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs }
    }
  } else {
    entry = { count: 0, resetTime: now + windowMs }
  }

  const allowed = entry.count < maxRequests

  if (allowed) {
    entry.count++
    localStorage.setItem(storageKey, JSON.stringify(entry))
  }

  return {
    allowed,
    remaining: Math.max(0, maxRequests - entry.count),
    resetIn: entry.resetTime - now,
  }
}
```

**Utilisation :**

```typescript
// src/components/AddDoorForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const { allowed, remaining, resetIn } = checkClientRateLimit('door_upload', 10)

  if (!allowed) {
    const resetMinutes = Math.ceil(resetIn / 60000)
    alert(`Rate limit exceeded. Try again in ${resetMinutes} minutes.`)
    return
  }

  // Continue...
}
```

### ✅ Avantages

- Très simple
- Gratuit
- Pas de service externe

### ❌ Inconvénients

- ⚠️ **FACILEMENT CONTOURNABLE** (clear localStorage)
- Pas de protection serveur
- Pas de synchronisation entre devices
- **NE PAS UTILISER EN PRODUCTION**

---

## 📊 COMPARAISON DES OPTIONS

| Option | Difficulté | Coût | Sécurité | Performance | Production |
|--------|------------|------|----------|-------------|------------|
| **Supabase Functions** | 🟢 Facile | Gratuit | 🟢 Excellente | 🟢 Excellente | ✅ OUI |
| **Upstash Redis** | 🟡 Moyenne | Gratuit* | 🟢 Excellente | 🟢 Excellente | ✅ OUI |
| **Vercel Edge** | 🔴 Difficile | Gratuit | 🟢 Excellente | 🟢 Excellente | ✅ OUI (Next.js) |
| **Client-side** | 🟢 Facile | Gratuit | 🔴 Mauvaise | 🟡 Moyenne | ❌ NON |

*Gratuit jusqu'à 10k req/jour, puis $0.20/10k

---

## 🎯 RECOMMANDATION FINALE

### Pour ton cas (My Parisian Doors)

**Choix #1 : Supabase Functions** ✅

**Pourquoi :**
- Tu utilises déjà Supabase
- Gratuit à 100%
- Facile à implémenter
- Suffisant pour une beta/MVP

**Implémentation :**
1. Créer fonction `check_door_rate_limit()`
2. Modifier policy INSERT
3. Gérer erreur côté client
4. **Temps : 30 minutes**

**Choix #2 : Upstash (si croissance)**

**Quand migrer :**
- Si > 1000 users actifs/jour
- Si besoin analytics avancés
- Si besoin rate limiting sur autres actions (favoris, etc.)

---

## 🚀 IMPLÉMENTATION RAPIDE (15 MINUTES)

### Étape par étape

```sql
-- 1. Dans Supabase SQL Editor
CREATE OR REPLACE FUNCTION check_door_rate_limit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM doors
  WHERE user_id = user_uuid
  AND date_added > NOW() - INTERVAL '1 hour';

  RETURN recent_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Modifier la policy
DROP POLICY IF EXISTS "Users can insert their own doors" ON doors;

CREATE POLICY "Users can insert their own doors"
ON doors FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND check_door_rate_limit(auth.uid())
);

-- 3. Tester
SELECT check_door_rate_limit('YOUR_USER_ID');
-- Doit retourner true si < 10 doors dans la dernière heure
```

```typescript
// 4. Modifier src/lib/supabase.ts
export async function addDoor(door: Omit<Door, 'id'>): Promise<Door | null> {
  // ... existing code ...

  const { data, error } = await supabase
    .from('doors')
    .insert([...])
    .select()
    .single()

  if (error) {
    // Nouveau : Détecter rate limit
    if (error.code === '23514' || error.message.includes('rate_limit')) {
      logger.warn('Rate limit exceeded', { userId: user.id })
      throw new Error('Rate limit: You can only add 10 doors per hour. Please try again later.')
    }

    logger.error('Error inserting door', error)
    return null
  }

  return transformedData
}
```

```typescript
// 5. Modifier src/pages/Index.tsx
const handleAddDoor = async (newDoorData: Omit<Door, 'id'>) => {
  try {
    const addedDoor = await addDoor(newDoorData);

    if (addedDoor) {
      setDoors(prev => [addedDoor, ...prev]);
      toast.success('Door added successfully!');
    }
  } catch (error) {
    if (error.message.includes('Rate limit')) {
      toast.error(error.message, { duration: 5000 });
    } else {
      toast.error('Error adding door. Please try again.');
    }
  }
}
```

**C'est tout ! Rate limiting activé en 15 minutes.**

---

## 📈 MONITORING

### Vérifier le rate limiting

```sql
-- Voir qui a été rate limited
SELECT
  user_id,
  COUNT(*) as door_count,
  MAX(date_added) as last_door
FROM doors
WHERE date_added > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) >= 10
ORDER BY door_count DESC;
```

### Analytics Upstash (si utilisé)

Dashboard Upstash affiche automatiquement :
- Nombre de requêtes bloquées
- Users les plus actifs
- Tendances over time

---

## 🆘 TROUBLESHOOTING

### "Policy rejected" même avec < 10 doors

**Cause :** Fonction pas créée ou erreur SQL

**Solution :**
```sql
-- Vérifier que la fonction existe
SELECT proname FROM pg_proc WHERE proname = 'check_door_rate_limit';

-- Si vide, re-créer la fonction
```

### Rate limit trop strict

**Ajuster le nombre :**
```sql
-- Changer de 10 à 20 doors/heure
CREATE OR REPLACE FUNCTION check_door_rate_limit(user_uuid uuid)
RETURNS boolean AS $$
...
  RETURN recent_count < 20; -- ← Modifier ici
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Besoin de reset manuel

```sql
-- Reset pour un user spécifique
DELETE FROM doors
WHERE user_id = 'USER_UUID'
AND date_added > NOW() - INTERVAL '1 hour';
```

---

## ✅ CHECKLIST FINALE

- [ ] Fonction `check_door_rate_limit()` créée
- [ ] Policy INSERT modifiée
- [ ] Gestion erreur côté client
- [ ] UI feedback (toast/alert)
- [ ] Tests avec user réel
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

---

**🎉 Rate limiting implémenté ! Ton app est maintenant protégée contre le spam.**
