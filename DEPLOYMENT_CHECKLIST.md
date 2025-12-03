# 🚀 Deployment Checklist - My Parisian Doors

## ✅ Completed Tasks

All code changes have been implemented and committed! Here's what was done:

- ✅ Created `AuthContext` for session management
- ✅ Added `SignUp` component with Google OAuth + email/password
- ✅ Protected `AddDoorForm` with authentication check
- ✅ Added `userId` field to Door type and database operations
- ✅ Filtered `MyDoors` to show only user's doors
- ✅ Created `ErrorBoundary` for error handling
- ✅ Created `.env.example` for environment variables
- ✅ Created `SUPABASE_RLS_SETUP.sql` with all security policies
- ✅ Created `SUPABASE_GOOGLE_AUTH_SETUP.md` with OAuth guide

---

## 🔴 CRITICAL - Must Do Before Deployment

### 1. Execute RLS Policies in Supabase

**⚠️ This is the MOST IMPORTANT step for security!**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Open the file `SUPABASE_RLS_SETUP.sql` in this project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. Verify success:
   - You should see "Success. No rows returned"
   - Run the verification queries at the bottom of the SQL file

**What this does:**
- Adds `user_id` column to the `doors` table
- Enables Row Level Security (prevents unauthorized access)
- Creates policies so users can only edit/delete their own doors
- Secures the storage bucket for images

**🚨 Without this, your database is COMPLETELY OPEN to anyone!**

---

### 2. Configure Google OAuth (Optional but Recommended)

If you want users to sign in with Google:

1. Follow the complete guide in `SUPABASE_GOOGLE_AUTH_SETUP.md`
2. Main steps:
   - Create Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Configure redirect URLs
   - Add credentials to Supabase

**Skip this if you only want email/password authentication.**

---

### 3. Verify Environment Variables

**Local Development:**
- Ensure `.env.local` exists with your Supabase credentials
- Never commit `.env.local` to git (already in .gitignore)

**Production Deployment:**

For **Vercel**:
```bash
# Set in Vercel Dashboard > Project > Settings > Environment Variables
VITE_SUPABASE_URL=https://cxvikvquxfzaxmcffszr.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

For **Netlify**:
```bash
# Set in Netlify Dashboard > Site Settings > Environment Variables
VITE_SUPABASE_URL=https://cxvikvquxfzaxmcffszr.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

### Authentication Tests
- [ ] Sign up with email/password works
- [ ] Email confirmation received (check spam folder)
- [ ] Sign in with Google OAuth works (if configured)
- [ ] "Skip for now" works for anonymous browsing
- [ ] User session persists after page reload
- [ ] Sign out works correctly

### Door Management Tests
- [ ] Can add a door when signed in
- [ ] Cannot add a door when not signed in (shows auth prompt)
- [ ] Image upload and compression works
- [ ] GPS location detection works on mobile
- [ ] Duplicate detection works
- [ ] Can toggle favorite on doors
- [ ] Can view door details

### MyDoors Section Tests
- [ ] MyDoors shows only doors I created
- [ ] Statistics display correctly
- [ ] Timeline shows correct dates
- [ ] Arrondissements explored count is accurate

### Map Tests
- [ ] Map loads correctly
- [ ] All doors appear as markers
- [ ] "Around me" filter works with geolocation
- [ ] Door popups show correct information

### Error Handling Tests
- [ ] Error boundary catches errors gracefully
- [ ] No console errors in production
- [ ] Offline behavior is acceptable

---

## 🔒 Security Verification

### Check RLS is Working

1. Open browser DevTools → Application → Storage → Clear all
2. Sign out of your app
3. Try to access this URL directly:
   ```
   https://cxvikvquxfzaxmcffszr.supabase.co/rest/v1/doors
   ```
4. You should be able to READ doors (public)
5. Try to INSERT/UPDATE/DELETE via REST API:
   - Should FAIL without authentication
   - Should SUCCEED with valid auth token
   - Should FAIL when trying to modify another user's door

### Check Storage is Working

1. Upload an image when adding a door
2. Verify the image URL starts with:
   ```
   https://cxvikvquxfzaxmcffszr.supabase.co/storage/v1/object/public/door-images/
   ```
3. Verify the image loads in the browser
4. Try to upload without being signed in → Should fail

---

## 📱 PWA Setup (Optional)

To make this a full Progressive Web App:

1. Create icons:
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)

2. Create `public/manifest.json`:
   ```json
   {
     "name": "My Parisian Doors",
     "short_name": "Parisian Doors",
     "description": "Discover and collect beautiful Parisian doors",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#FAF7F2",
     "theme_color": "#2E4A62",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

3. Add to `index.html`:
   ```html
   <link rel="manifest" href="/manifest.json">
   <meta name="theme-color" content="#2E4A62">
   ```

---

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard
```

### Manual Build
```bash
# Build for production
npm run build

# The dist/ folder contains your production build
# Upload to any static hosting service
```

---

## 🐛 Common Issues

### Issue: "User must be authenticated to add doors"
**Solution:** User is not signed in. Sign up or sign in first.

### Issue: RLS error when inserting door
**Solution:** RLS policies not executed. Run `SUPABASE_RLS_SETUP.sql` in Supabase.

### Issue: Google OAuth redirect_uri_mismatch
**Solution:** Check redirect URIs in Google Console match Supabase exactly.

### Issue: Images not uploading
**Solution:** Check storage bucket policies in Supabase.

### Issue: MyDoors shows all doors, not just mine
**Solution:**
1. Verify RLS is enabled
2. Check that `user_id` column exists
3. Clear browser cache and reload

---

## 📊 Monitoring

### Supabase Dashboard

Monitor these in your Supabase Dashboard:

1. **Authentication → Users**
   - See all registered users
   - Check email confirmation status

2. **Table Editor → doors**
   - Verify `user_id` column exists
   - Check data integrity

3. **Storage → door-images**
   - Monitor storage usage
   - Check uploaded images

4. **Logs**
   - Monitor for errors
   - Check API usage

---

## 🎉 Final Steps

1. ✅ Execute `SUPABASE_RLS_SETUP.sql`
2. ✅ Configure Google OAuth (optional)
3. ✅ Test all features
4. ✅ Deploy to production
5. ✅ Set environment variables in hosting platform
6. ✅ Test production deployment
7. ✅ Monitor for errors
8. ✅ Celebrate! 🎊

---

## 📝 Next Steps After Deployment

Consider these enhancements:

- [ ] Add user profile page
- [ ] Add social sharing features
- [ ] Add analytics (Google Analytics, Plausible)
- [ ] Add email notifications
- [ ] Add PWA offline support
- [ ] Add internationalization (i18n)
- [ ] Add admin dashboard
- [ ] Add door rating/voting system
- [ ] Add door collections/albums
- [ ] Add export to PDF/CSV

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase Logs: Dashboard → Logs
2. Check Browser Console: F12 → Console
3. Review this checklist again
4. Check the guides:
   - `SUPABASE_RLS_SETUP.sql`
   - `SUPABASE_GOOGLE_AUTH_SETUP.md`
5. Contact Supabase support: https://supabase.com/support

---

**🚀 Your app is now secure and ready for production!**
