# OAuth Setup Guide

> **Status:** Code implementation is complete. Manual Supabase configuration required.

This document tracks the manual configuration steps required to enable Google and GitHub OAuth authentication for TaskFlow.

---

## What's Already Done ✅

| Task | File | Status |
|------|------|--------|
| Auth callback route | `app/auth/callback/route.ts` | ✅ Complete |
| OAuth buttons component | `app/login/components/OAuthButtons.tsx` | ✅ Complete |
| Server client cookie handling | `lib/supabase/server.ts` | ✅ Complete |
| Integration into login form | `app/login/components/AuthForm.tsx` | ✅ Complete |
| Middleware configuration | `middleware.ts` | ✅ Complete |
| TypeScript type checking | All files | ✅ Passing |

---

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **TaskFlow** project

---

## Step 2: Configure Google OAuth

### 2.1 Enable in Supabase

1. Navigate to **Authentication** → **Providers** → **Google**
2. Toggle **Enable** to ON
3. Click **Save**

### 2.2 Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (local)
   - `https://your-production-domain.com/auth/callback` (production)
7. Copy **Client ID** and **Client Secret**

### 2.3 Add to Supabase

1. Paste **Client ID** and **Client Secret** in Supabase Google provider settings
2. Click **Save**

---

## Step 3: Configure GitHub OAuth

### 3.1 Enable in Supabase

1. Navigate to **Authentication** → **Providers** → **GitHub**
2. Toggle **Enable** to ON
3. Click **Save**

### 3.2 Get GitHub Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: TaskFlow (or your preference)
   - **Homepage URL**: `http://localhost:3000` (local)
   - **Authorization callback URL**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy **Client ID** and generate a new **Client Secret**

### 3.3 Add to Supabase

1. Paste **Client ID** and **Client Secret** in Supabase GitHub provider settings
2. Click **Save**

---

## Step 4: Configure Redirect URLs

1. Navigate to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production URL when deploying

---

## Testing

After configuration, test the OAuth flow:

```bash
# Run development server
npm run dev

# Navigate to
http://localhost:3000/login
```

1. Click **Continue with Google** or **Continue with GitHub**
2. Complete OAuth flow on provider's page
3. Verify redirect to `/dashboard`
4. Check `users` table in Supabase - user should be created automatically

---

## Notes

- **No environment variables needed** - Supabase stores OAuth secrets
- **User sync is automatic** - Callback route creates user record via `upsert`
- **Same user model** - OAuth users use identical `User` table structure
- **RLS policies apply** - OAuth users follow same security rules

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Redirect error | Check redirect URL matches exactly (no trailing slash) |
| "Auth code error" | Verify Client ID and Secret are correct |
| User not created | Check Supabase logs for callback errors |
| Infinite redirect | Clear browser cookies and try again |

---

## References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
