# OAuth Setup TODO

This document tracks the manual configuration steps required to enable Google and GitHub OAuth authentication for TaskFlow.

**Status:** Code implementation is complete. Manual Supabase configuration required.

---

## ✅ Completed (Code Implementation)

| Task | Status | File |
|------|--------|------|
| Create auth callback route | ✅ Done | `app/auth/callback/route.ts` |
| Create OAuth buttons component | ✅ Done | `app/login/components/OAuthButtons.tsx` |
| Update server client for cookie handling | ✅ Done | `lib/supabase/server.ts` |
| Integrate OAuth into login form | ✅ Done | `app/login/components/AuthForm.tsx` |
| Update middleware configuration | ✅ Done | `middleware.ts` |
| TypeScript type check | ✅ Passed | `tsc --noEmit` |
| Production build | ✅ Success | `npm run build` |

---

## 📋 Pending (Supabase Configuration)

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project **TaskFlow** (`egitynomcplkkichnzju`)

### Step 2: Configure Google OAuth

1. Navigate to **Authentication** → **Providers** → **Google**
2. Toggle **Enable** to ON
3. Click **Save**

#### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (local)
   - `https://your-production-domain.com/auth/callback` (production)
7. Copy **Client ID** and **Client Secret**

#### Add to Supabase

1. Paste **Client ID** and **Client Secret** in Supabase Google provider settings
2. Click **Save**

### Step 3: Configure GitHub OAuth

1. Navigate to **Authentication** → **Providers** → **GitHub**
2. Toggle **Enable** to ON
3. Click **Save**

#### Get GitHub Credentials

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `TaskFlow` (or your preference)
   - Homepage URL: `http://localhost:3000` (local)
   - Authorization callback URL: `https://egitynomcplkkichnzju.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy **Client ID** and generate a new **Client Secret**

#### Add to Supabase

1. Paste **Client ID** and **Client Secret** in Supabase GitHub provider settings
2. Click **Save**

### Step 4: Configure Redirect URLs

1. Navigate to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production URL when deploying

---

## 🧪 Testing

After configuration, test OAuth flow:

1. Run development server: `npm run dev`
2. Navigate to `http://localhost:3000/login`
3. Click **Continue with Google** or **Continue with GitHub**
4. Complete OAuth flow on provider's page
5. Verify redirect to `/dashboard`
6. Check `users` table in Supabase - user should be created automatically

---

## 📝 Notes

- **No environment variables needed** - Supabase stores OAuth secrets
- **User sync is automatic** - Callback route creates Prisma user record via `upsert`
- **Same user model** - OAuth users use identical `User` table structure
- **RLS policies apply** - OAuth users follow same security rules as email/password users

---

## 🔗 References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
