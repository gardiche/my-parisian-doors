# 🌟 User-Specific Favorites Migration

## Problem
Previously, favorites were stored in the `doors` table with a single `is_favorite` column, which meant all users shared the same favorites. This wasn't user-specific.

## Solution
Created a new `user_favorites` table to store favorites per user, making favorites personal to each account.

---

## Migration Steps

### Step 1: Run the Migration SQL

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Click **New query**
3. Copy and paste the entire content of `supabase-favorites-migration.sql`
4. Click **Run**

This will:
- ✅ Create `user_favorites` table
- ✅ Set up indexes for performance
- ✅ Enable Row Level Security (RLS)
- ✅ Create policies for user access
- ✅ Create admin policies for full access

### Step 2: Deploy the Code Changes

The code changes have already been pushed to Vercel and include:
- Updated `fetchAllDoors()` to load user-specific favorites
- Updated `toggleFavoriteDoor()` to use the new table
- Maintained backward compatibility

### Step 3: Verify It Works

1. Sign in to your app
2. Mark a door as favorite (heart icon)
3. Sign out and sign in with a different account
4. Verify that the favorite is NOT shown (it's user-specific now!)

---

## New Database Schema

### `user_favorites` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `auth.users(id)` |
| `door_id` | UUID | References `doors(id)` |
| `created_at` | TIMESTAMP | When the favorite was added |

**Constraints:**
- Unique constraint on `(user_id, door_id)` prevents duplicate favorites

---

## What Changed in the Code

### Before (Shared Favorites)
```typescript
// doors table had is_favorite column
isFavorite: door.is_favorite || false
```

### After (User-Specific Favorites)
```typescript
// Query user_favorites table for current user
const { data: favoritesData } = await supabase
  .from('user_favorites')
  .select('door_id')
  .eq('user_id', user.id)

// Check if this door is in user's favorites
isFavorite: userFavorites.has(door.id)
```

---

## Features

✅ **User-Specific**
- Each user has their own favorites
- Favorites are private to each account

✅ **Performant**
- Indexed on `user_id` and `door_id`
- Efficient queries even with many favorites

✅ **Secure**
- RLS policies ensure users can only see/modify their own favorites
- Admins can view all favorites

✅ **Backward Compatible**
- Old `is_favorite` column still exists (can be removed later)
- Seamless migration without breaking existing functionality

---

## Optional: Migrate Existing Favorites

If you want to preserve existing favorites from the old system, uncomment this section in the SQL file:

```sql
INSERT INTO public.user_favorites (user_id, door_id)
SELECT
  user_id,
  id as door_id
FROM public.doors
WHERE is_favorite = true
  AND user_id IS NOT NULL
ON CONFLICT (user_id, door_id) DO NOTHING;
```

⚠️ **Note:** This assumes `is_favorite` was set for specific users. Adjust as needed.

---

## Optional: Remove Old Column

After verifying the new system works, you can remove the old `is_favorite` column:

```sql
ALTER TABLE public.doors DROP COLUMN IF EXISTS is_favorite;
```

---

## Troubleshooting

### Favorites not showing up?

1. **Check the migration ran successfully:**
   ```sql
   SELECT * FROM public.user_favorites LIMIT 5;
   ```

2. **Verify RLS policies are active:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_favorites';
   ```

3. **Sign out and sign back in** to refresh the session

### Can't add favorites?

1. Check you're signed in
2. Verify the user exists in `auth.users`
3. Check browser console for errors

---

## Testing Queries

```sql
-- Count favorites per user
SELECT
  u.email,
  COUNT(uf.*) as favorite_count
FROM auth.users u
LEFT JOIN public.user_favorites uf ON u.id = uf.user_id
GROUP BY u.id, u.email
ORDER BY favorite_count DESC;

-- See all favorites for a specific user
SELECT
  d.location,
  d.neighborhood,
  uf.created_at as favorited_at
FROM public.user_favorites uf
JOIN public.doors d ON uf.door_id = d.id
WHERE uf.user_id = 'YOUR-USER-ID-HERE'
ORDER BY uf.created_at DESC;
```

---

## Benefits

🎯 **User Privacy**
- Favorites are personal
- No shared state between users

📊 **Analytics Ready**
- Track which doors are most favorited
- Understand user preferences
- See favorite trends over time

🔒 **Secure**
- RLS prevents unauthorized access
- Users can only modify their own favorites

🚀 **Scalable**
- Efficient indexing
- No performance degradation with more users
