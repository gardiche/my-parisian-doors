-- ====================================
-- FAVORITES MIGRATION - USER-SPECIFIC FAVORITES
-- ====================================
-- This creates a new table to store user-specific favorites
-- instead of using a shared is_favorite column

-- 1. Create the favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  door_id UUID NOT NULL REFERENCES public.doors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only favorite a door once
  UNIQUE(user_id, door_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_door_id ON public.user_favorites(door_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- 3. Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.user_favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.user_favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites"
ON public.user_favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites"
ON public.user_favorites
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admins can delete any favorite
CREATE POLICY "Admins can delete any favorite"
ON public.user_favorites
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 5. OPTIONAL: Migrate existing favorites from doors table
-- Uncomment this if you want to preserve existing favorites
-- WARNING: This assumes is_favorite was set for a specific user
-- You may need to adjust this based on your data

/*
INSERT INTO public.user_favorites (user_id, door_id)
SELECT
  user_id,
  id as door_id
FROM public.doors
WHERE is_favorite = true
  AND user_id IS NOT NULL
ON CONFLICT (user_id, door_id) DO NOTHING;
*/

-- 6. OPTIONAL: Remove old is_favorite column
-- Uncomment after verifying the new system works
-- ALTER TABLE public.doors DROP COLUMN IF EXISTS is_favorite;

-- ====================================
-- VERIFICATION QUERIES
-- ====================================

-- Count favorites per user
-- SELECT user_id, COUNT(*) as favorite_count
-- FROM public.user_favorites
-- GROUP BY user_id;

-- Get all favorites for current user
-- SELECT * FROM public.user_favorites WHERE user_id = auth.uid();
