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
-- STORAGE BUCKET SECURITY
-- =====================================================
-- These policies secure the door-images storage bucket

-- Step 8: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 9: Drop existing storage policies if any
DROP POLICY IF EXISTS "Public read access to door images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload door images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own door images" ON storage.objects;

-- Step 10: Public read access to door images
CREATE POLICY "Public read access to door images"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING (bucket_id = 'door-images');

-- Step 11: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload door images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'door-images');

-- Step 12: Users can delete their own images
-- Note: This assumes you'll implement image ownership tracking later
CREATE POLICY "Users can delete their own door images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'door-images');

-- =====================================================
-- OPTIONAL: Migrate existing doors to a system user
-- =====================================================
-- If you have existing doors without user_id, you can:
-- 1. Create a system user for preset/existing doors
-- 2. Update existing doors to have that user_id
-- 3. Or leave them as NULL (they won't be editable)

-- Example: Set existing doors to NULL user_id (public/preset doors)
-- UPDATE doors SET user_id = NULL WHERE user_id IS NULL;

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

-- List all policies on storage.objects
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Count doors with and without user_id
SELECT
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as doors_with_user,
  COUNT(*) FILTER (WHERE user_id IS NULL) as doors_without_user
FROM doors;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. After running this SQL, you MUST update your application code
--    to include user_id when inserting doors
-- 2. Existing doors with NULL user_id will be viewable by everyone
--    but not editable/deletable
-- 3. Make sure to test authentication in your app after this change
-- 4. The storage policies allow anyone to read images but only
--    authenticated users can upload
-- =====================================================
