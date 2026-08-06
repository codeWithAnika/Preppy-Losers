# Supabase + Google OAuth — Dashboard Setup

Google Sign-In requires configuration in **two places**:

1. **Google Cloud Console** — Google knows about your app
2. **Supabase Dashboard** — Supabase connects Google to your auth system

Google credentials do **not** go in `.env` files. Only these app env vars are needed:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**This project's Supabase reference:** `hcylhedomtjdkwfryasx`

---

## Step 1: Google Cloud Console

### Create OAuth 2.0 credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. **APIs & Services** → **Credentials**
4. **+ Create Credentials** → **OAuth client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: PREPPY LOSERS
   - Scopes: `email`, `profile`
6. Create credentials:
   - Application type: **Web application**
   - Name: `Supabase OAuth`
   - **Authorized redirect URIs** — add exactly:
     ```
     https://hcylhedomtjdkwfryasx.supabase.co/auth/v1/callback
     ```
7. Save **Client ID** and **Client Secret**

---

## Step 2: Supabase Dashboard

### Enable Google provider

1. [Supabase Dashboard](https://app.supabase.com) → project **hcylhedomtjdkwfryasx**
2. **Authentication** → **Providers** → **Google**
3. Toggle **Enabled** ON
4. Paste Client ID and Client Secret from Google Cloud Console
5. **Save**

### Redirect URLs

**Authentication** → **URL Configuration** → **Redirect URLs:**

```
http://localhost:3000/auth/callback**
https://preppylosers.com/auth/callback**
https://www.preppylosers.com/auth/callback**
```

Notes:

- Use `**` wildcard (allows `?next=` query params)
- No trailing slash
- One URL per line

### Site URL

Set **Site URL** to:

```
https://preppylosers.com
```

---

## OAuth flow (why URLs differ)

```
Your app (preppylosers.com)
  → Google (accounts.google.com)
  → Supabase (hcylhedomtjdkwfryasx.supabase.co/auth/v1/callback)
  → Your app (/auth/callback?code=...)
```

| Where | Redirect URI |
|-------|----------------|
| Google Cloud Console | `https://hcylhedomtjdkwfryasx.supabase.co/auth/v1/callback` |
| Supabase Redirect URLs | `https://preppylosers.com/auth/callback**` |

---

## Verification checklist

```
Google Cloud Console:
[ ] OAuth client type: Web application
[ ] Redirect URI: https://hcylhedomtjdkwfryasx.supabase.co/auth/v1/callback

Supabase Dashboard:
[ ] Google provider enabled
[ ] Client ID + Secret pasted
[ ] Redirect URLs include localhost + production (with **)
[ ] Site URL: https://preppylosers.com

Your app (.env.local):
[ ] NEXT_PUBLIC_SUPABASE_URL set
[ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
[ ] NO GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in env files
```

---

## Testing

```bash
npm run dev
# Open http://localhost:3000/login
# Click "Continue with Google"
```

Expected:

1. Redirect to `accounts.google.com`
2. Return to `/auth/callback?code=...`
3. Land logged in (account icon links to `/account`)
4. Cookie present: `sb-*-auth-token` (DevTools → Application → Cookies)
5. Refresh stays logged in

---

## Error reference

| URL param | Meaning | Fix |
|-----------|---------|-----|
| `?error=auth_callback_failed` | Code exchange failed | Check Supabase Google provider credentials |
| `?error=auth_callback_failed&reason=...` | Specific failure | Read `reason` on login page |
| `?error=rate_limited` | Too many full page loads of `/login` or `/signup` (30 / 15 min per IP) | Wait 15 min; RSC/prefetch and `/auth/callback` are not counted |
| Google `redirect_uri_mismatch` | Wrong URI in Google Console | Must point to Supabase, not your app domain |

---

## Common mistakes

**❌ Google credentials in `.env.local`**
Credentials belong in Supabase Dashboard → Providers only.

**❌ Google redirect points to your app**
```
# Wrong
https://preppylosers.com/auth/callback

# Correct
https://hcylhedomtjdkwfryasx.supabase.co/auth/v1/callback
```

**❌ Missing wildcard on Supabase redirect URLs**
```
# Wrong
https://preppylosers.com/auth/callback

# Correct
https://preppylosers.com/auth/callback**
```

---

## Code fixes (already applied)

These code-level bugs are fixed in the repo:

1. **Session cookies on redirect** — `lib/supabase/route-handler.ts` + `app/auth/callback/route.ts`
2. **Rate limiting** — `/auth/callback` excluded from auth rate limit in `middleware.ts`
3. **Production origin** — `resolveAuthRedirectOrigin()` uses `x-forwarded-host`

See also: `components/auth/GoogleAuthButton.tsx`

---

## Security

- Never commit Google Client Secret to git
- Store credentials in Supabase Dashboard only
- Rotate credentials if leaked
