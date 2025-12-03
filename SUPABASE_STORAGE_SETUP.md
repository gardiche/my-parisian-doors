# Supabase Storage Configuration

## 📦 Storage Bucket Setup

The storage policies must be configured via the Supabase Dashboard UI (not SQL).

---

## Step 1: Verify the Bucket Exists

1. Go to: **Supabase Dashboard** → **Storage**
2. Look for a bucket named: **`door-images`**
3. If it doesn't exist:
   - Click **"New bucket"**
   - Name: `door-images`
   - Public bucket: **Yes** ✅
   - Click **Create**

---

## Step 2: Configure Storage Policies

### Option A: Via UI (Recommended)

1. Go to: **Storage** → **Policies**
2. Select the **`door-images`** bucket
3. You should see a policies section

#### Policy 1: Public Read Access
- Click **"New Policy"**
- Template: Select **"Give users access to a folder"** or start from scratch
- Policy name: `Public read access`
- Allowed operations: **SELECT** ✅
- Target roles: **`public`** or **`anon`** + **`authenticated`**
- Policy definition:
  ```sql
  bucket_id = 'door-images'
  ```
- Click **Save**

#### Policy 2: Authenticated Upload
- Click **"New Policy"**
- Policy name: `Authenticated users can upload`
- Allowed operations: **INSERT** ✅
- Target roles: **`authenticated`**
- Policy definition:
  ```sql
  bucket_id = 'door-images'
  ```
- Click **Save**

#### Policy 3: Users Can Delete Their Own Images
- Click **"New Policy"**
- Policy name: `Users can delete own images`
- Allowed operations: **DELETE** ✅
- Target roles: **`authenticated`**
- Policy definition:
  ```sql
  bucket_id = 'door-images' AND auth.uid()::text = (storage.foldername(name))[1]
  ```
- Click **Save**

---

### Option B: Via SQL (If UI doesn't work)

If the UI doesn't work, you can try running this **AS THE POSTGRES ADMIN**:

```sql
-- Public read access
CREATE POLICY "Public read access to door images"
ON storage.objects FOR SELECT
TO public, authenticated, anon
USING (bucket_id = 'door-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload door images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'door-images');

-- Users can delete their own images
CREATE POLICY "Users can delete their own door images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'door-images');
```

**Note:** You might still get the "must be owner" error with SQL. If so, use the UI method above.

---

## Step 3: Test the Configuration

### Test 1: Public Read

1. Upload an image via your app (when signed in)
2. Copy the image URL
3. Open the URL in an **incognito window** (not logged in)
4. ✅ Image should load

### Test 2: Upload Requires Auth

1. Sign out of your app
2. Try to add a door
3. ✅ Should show "Authentication Required" message

### Test 3: Users Can Upload

1. Sign in to your app
2. Try to add a door with an image
3. ✅ Upload should succeed
4. ✅ Image should appear in Storage → `door-images` bucket

---

## 🔍 Verify Storage Setup

### Check via Dashboard

1. **Storage** → **door-images** bucket
2. You should see uploaded images
3. Click on an image → Copy URL
4. URL format should be:
   ```
   https://cxvikvquxfzaxmcffszr.supabase.co/storage/v1/object/public/door-images/doors/[filename].jpg
   ```

### Check Policies

1. **Storage** → **Policies**
2. Select **door-images** bucket
3. You should see 3 policies:
   - ✅ Public read access (SELECT)
   - ✅ Authenticated upload (INSERT)
   - ✅ Delete own images (DELETE)

---

## 🚨 Troubleshooting

### Images not uploading
**Solution:**
1. Check if bucket `door-images` exists
2. Check if bucket is **public**
3. Verify **INSERT** policy exists for authenticated users
4. Check browser console for errors

### Images not loading
**Solution:**
1. Check if bucket is **public**
2. Verify **SELECT** policy exists
3. Try accessing image URL in incognito mode
4. Check image URL format is correct

### "Policy not found" error
**Solution:**
1. Go to Storage → Policies
2. Delete all policies for `door-images`
3. Recreate them one by one using the UI
4. Test after each policy

---

## ✅ Final Checklist

- [ ] Bucket `door-images` exists
- [ ] Bucket is set to **public**
- [ ] Public read policy (SELECT) configured
- [ ] Authenticated upload policy (INSERT) configured
- [ ] Delete own images policy (DELETE) configured
- [ ] Tested image upload when signed in
- [ ] Tested image viewing when signed out
- [ ] Image URLs load in incognito mode

---

## 📝 Storage Structure

Images are stored in this structure:

```
door-images/
└── doors/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.jpg
    └── ...
```

The `doors/` prefix is automatically added by the app when uploading.

---

**🎉 Once all checkboxes are checked, your storage is fully configured!**
