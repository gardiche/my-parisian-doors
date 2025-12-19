# 🔐 Admin Setup Guide

## How to Create an Admin Account

This guide explains how to set up an admin account with full privileges on your My Parisian Doors app.

---

## Step 1: Create or Select a User Account

First, you need an existing user account. You can:
- Create a new account via the app's Sign Up page
- Use an existing account

**Note the email address** of the account you want to make admin.

---

## Step 2: Grant Admin Role in Supabase

### Option A: Using SQL Editor (Recommended)

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**

2. Run this SQL command:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

3. Click **Run** to execute

### Option B: Using Authentication UI

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Users**

2. Find and click on the user you want to make admin

3. Scroll to **User Metadata** section

4. Click **Edit** and add:
```json
{
  "role": "admin"
}
```

5. Click **Save**

---

## Step 3: Set Up RLS Policies for Admin

Run the SQL commands from `supabase-admin-policies.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor**
2. Click **New query**
3. Copy and paste the entire content of `supabase-admin-policies.sql`
4. Click **Run**

This will:
- Create an `is_admin()` helper function
- Set up policies allowing admins to view/edit/delete all doors
- Grant admin access to storage buckets

---

## Step 4: Verify Admin Access

1. **Sign out** from the app (if logged in)
2. **Sign in** with your admin account
3. You should now see:
   - ⚙️ **Admin button** in the top-right corner
   - Access to the **Admin Panel** with full privileges

---

## Admin Privileges

Once configured, admin users have:

✅ **Full Access to All Doors**
- View all doors from all users
- Edit any door
- Delete any door

✅ **Storage Access**
- Upload images to any bucket
- Update/delete any image

✅ **Admin Panel UI**
- Access to admin-only features
- Visible admin button in the interface

---

## Verify Admin Status

### In the App
- Sign in with the admin account
- Look for the admin button (⚙️) in the top-right corner

### In Supabase SQL Editor
Run this query while signed in:
```sql
SELECT auth.is_admin();
```

It should return `true` for admin users.

---

## Remove Admin Access

To remove admin privileges from a user:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'user-email@example.com';
```

---

## Security Notes

⚠️ **Important:**
- Admin access gives **full control** over the app
- Only grant admin to **trusted users**
- Admin privileges include the ability to:
  - Delete any content
  - Access all user data
  - Modify any door in the database

🔒 **Best Practices:**
- Use a strong password for admin accounts
- Enable 2FA if available
- Regularly audit who has admin access
- Consider creating a dedicated admin email

---

## Troubleshooting

### Admin button not showing up?

1. **Sign out and sign in again** (to refresh the session)
2. **Check user metadata** in Supabase:
   - Go to Authentication → Users
   - Verify `role: "admin"` is in User Metadata
3. **Clear browser cache** and try again
4. **Check the console** for any errors

### RLS policies not working?

1. Verify policies are enabled in **Database** → **Policies**
2. Check that `auth.is_admin()` function exists:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'is_admin';
   ```
3. Re-run the policies SQL if needed

---

## Questions?

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify the SQL policies are correctly set up
3. Ensure you're signed in with the correct account
