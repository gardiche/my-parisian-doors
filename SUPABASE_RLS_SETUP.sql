-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) CONFIGURATION
-- =====================================================
-- Execute this SQL in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- Step 1: Add user_id column to doors table
-- This links each door to the user who created it
ALTER TABLE doors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Step 2: Enable Row Level Security on doors table
ALTER TABLE doors ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public doors are viewable by everyone" ON doors;
DROP POLICY IF EXISTS "Users can insert their own doors" ON doors;
DROP POLICY IF EXISTS "Users can update their own doors" ON doors;
DROP POLICY IF EXISTS "Users can delete their own doors" ON doors;
DROP POLICY IF EXISTS "Anonymous users can view doors" ON doors;

-- Step 4: Create SELECT policy - Everyone can view all doors
CREATE POLICY "Public doors are viewable by everyone"
ON doors FOR SELECT
TO authenticated, anon
USING (true);

-- Step 5: Create INSERT policy - Authenticated users can add doors
CREATE POLICY "Users can insert their own doors"
ON doors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Step 6: Create UPDATE policy - Users can only update their own doors
CREATE POLICY "Users can update their own doors"
ON doors FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 7: Create DELETE policy - Users can only delete their own doors
CREATE POLICY "Users can delete their own doors"
ON doors FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify your RLS setup:

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'doors';

-- List all policies on doors table
SELECT * FROM pg_policies WHERE tablename = 'doors';

-- Count doors with and without user_id
SELECT
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as doors_with_user,
  COUNT(*) FILTER (WHERE user_id IS NULL) as doors_without_user
FROM doors;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see "Success. No rows returned", RLS is configured!
-- Now configure Storage policies via the UI (see below)
-- =====================================================
