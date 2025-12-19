-- ====================================
-- ADMIN POLICIES FOR MY PARISIAN DOORS
-- ====================================
-- Run these in Supabase SQL Editor to give admin users full rights

-- First, create a helper function to check if a user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- DOORS TABLE POLICIES
-- ====================================

-- Allow admins to read all doors
CREATE POLICY "Admins can view all doors"
ON public.doors
FOR SELECT
TO authenticated
USING (auth.is_admin());

-- Allow admins to insert any door
CREATE POLICY "Admins can insert any door"
ON public.doors
FOR INSERT
TO authenticated
WITH CHECK (auth.is_admin());

-- Allow admins to update any door
CREATE POLICY "Admins can update any door"
ON public.doors
FOR UPDATE
TO authenticated
USING (auth.is_admin());

-- Allow admins to delete any door
CREATE POLICY "Admins can delete any door"
ON public.doors
FOR DELETE
TO authenticated
USING (auth.is_admin());

-- ====================================
-- OPTIONAL: Allow admins to bypass storage restrictions
-- ====================================

-- Allow admins to upload to any bucket
CREATE POLICY "Admins can upload to door-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'door-images'
  AND auth.is_admin()
);

-- Allow admins to update any file
CREATE POLICY "Admins can update door-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'door-images'
  AND auth.is_admin()
);

-- Allow admins to delete any file
CREATE POLICY "Admins can delete from door-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'door-images'
  AND auth.is_admin()
);

-- ====================================
-- VERIFICATION QUERY
-- ====================================
-- Run this to check if the current user is admin:
-- SELECT auth.is_admin();
