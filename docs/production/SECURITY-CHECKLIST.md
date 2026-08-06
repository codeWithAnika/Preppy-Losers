# Security Checklist — Production Launch

## Implemented in code

- [x] Content-Security-Policy (Razorpay, Supabase, Google, GA4, Sentry allowed)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security (production)
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy (restrict camera, mic, geolocation)
- [x] CORS restricted to preppylosers.com (+ localhost in dev)
- [x] Rate limiting: 100 req/min per IP (general)
- [x] Auth rate limiting: 30 navigations / 15 min on `/login` and `/signup` only (RSC/prefetch excluded)
- [x] `poweredByHeader: false`
- [x] Secrets in env only — see `lib/env/server.ts`, `SECRET_ENV_KEYS`
- [x] RLS on all Supabase tables
- [x] Admin UUID allowlist + role escalation prevention
- [x] Razorpay signature verification on payment edge functions

## Environment audit

Run before launch:

```bash
# Ensure no secrets in source
grep -r "rzp_live\|service_role\|RAZORPAY_KEY_SECRET" --include="*.ts" --include="*.tsx" .
# Should only match .env.example comments, never real values

# Verify .env.production is gitignored
git check-ignore .env.production .env.local
```

**Never commit:** `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

**Safe to expose (NEXT_PUBLIC_*):** Supabase URL, anon key, Razorpay Key ID (public), Sentry DSN, GA measurement ID

## XSS testing

| Test | How | Expected |
|------|-----|----------|
| Stored XSS in profile name | Set name to `<script>alert(1)</script>` | Rendered as text, not executed |
| Reflected XSS in URL | Visit `/login?error=<script>alert(1)</script>` | No script execution |
| DOM XSS in search | N/A (no search input) | — |
| CSP blocks inline scripts | DevTools → Console | Unauthorized scripts blocked |

Tools: OWASP ZAP (passive scan), manual DevTools review

## CSRF testing

| Test | How | Expected |
|------|-----|----------|
| Cross-origin POST to `/api/health` | curl from different Origin | CORS blocks or no cookie sent |
| Supabase auth | Uses PKCE + SameSite cookies | Protected by Supabase SSR |
| Razorpay payment | Server-side order creation + signature verify | Forged payments rejected |

Supabase Auth cookies use `SameSite=Lax` by default. Payment mutations go through authenticated edge functions.

## Injection testing

| Test | How | Expected |
|------|-----|----------|
| SQL injection in login | `' OR 1=1 --` in email | Auth fails, no DB error exposed |
| No raw SQL in app | Code review | All queries via Supabase client |
| Edge function input validation | Send malformed JSON to create-razorpay-order | 400 with safe error message |

## Auth brute force

- Middleware limits `/login`, `/signup`, `/auth/callback` to 5 requests / 15 min per IP
- Supabase Auth has built-in rate limits (configure in Dashboard → Auth → Rate Limits)
- Test: 30+ rapid full navigations to `/login` within 15 min → redirect with `?error=rate_limited`

## Pre-launch manual checklist

- [ ] Switch Razorpay from test to live keys
- [ ] Set `RAZORPAY_WEBHOOK_SECRET` in Supabase secrets
- [ ] Apply all pending SQL migrations (includes `admin_allowlist` table)
- [ ] Grant admins via `select public.grant_admin('<uuid>');` in SQL editor
- [ ] Confirm `FORCE_HTTPS=true` in production
- [ ] Confirm `ALLOWED_ORIGINS` includes production domain only
- [ ] Run `npm run build` clean
- [ ] Run `npm run test:e2e`
- [ ] Scan with OWASP ZAP (passive)
- [ ] Review Sentry for any errors on staging
- [ ] Test checkout end-to-end with live Razorpay (small amount)

## Reporting vulnerabilities

Contact: loserspreppy@gmail.com
