# PREPPY LOSERS — Production Launch Guide

Operational checklist for launching **preppylosers.com**. Code-level hardening is in the repo; external services require dashboard setup.

## What's implemented in code

| Area | Location |
|------|----------|
| Security headers (CSP, HSTS, X-Frame-Options, etc.) | `middleware.ts`, `lib/security/headers.ts`, `next.config.mjs` |
| HTTPS redirect | `middleware.ts` (`FORCE_HTTPS=true`) |
| CORS (preppylosers.com only) | `lib/security/cors.ts`, edge `supabase/functions/_shared/cors.ts` |
| Rate limiting (100 req/min IP) | `middleware.ts`, `lib/rate-limit.ts` |
| Auth rate limiting (5 / 15 min) | `middleware.ts` on `/login`, `/signup` only |
| Gzip compression | `compress: true` in `next.config.mjs` (enabled by default in prod) |
| Static cache headers + ETags | `next.config.mjs` (`generateEtags: true`, Cache-Control) |
| Image optimization (AVIF/WebP) | `next.config.mjs` `images` config |
| Sentry (errors, replay, perf) | `sentry.*.config.ts`, `instrumentation.ts`, `app/global-error.tsx` |
| Google Analytics 4 | `components/analytics/GoogleAnalytics.tsx` |
| Structured logging | `lib/logging/logger.ts` |
| Health check (uptime probes) | `GET /api/health` |
| Production DB indexes | `supabase/migrations/20260803140000_production_indexes.sql` |
| E2E test scaffold | `e2e/`, `playwright.config.ts` |
| Env templates | `.env.example`, `.env.production.example` |

## Sub-guides

- [SSL & HTTPS](./SSL-HTTPS.md)
- [CDN & caching](./CDN-CACHING.md)
- [Monitoring & alerts](./MONITORING.md)
- [Security testing](./SECURITY-CHECKLIST.md)
- [Testing (E2E, cross-browser, load)](./TESTING-CHECKLIST.md)
- [Database (backups, pooling, migrations)](./DATABASE.md)
- [Rollback procedure](./ROLLBACK.md)
- [Google OAuth (Supabase Auth)](./SUPABASE-GOOGLE-OAUTH.md)
- [Resend email](./RESEND-EMAIL.md)

## Quick start (Vercel — recommended)

1. Connect GitHub repo to Vercel
2. Set environment variables from `.env.production.example`
3. Set `FORCE_HTTPS=true` (Vercel terminates TLS automatically)
4. Add domain `preppylosers.com` in Vercel → DNS points to Vercel
5. Enable Cloudflare proxy (optional) — see CDN guide
6. Set Supabase edge secrets: `npx supabase secrets set ...`
7. Apply migrations: `npx supabase db push`
8. Switch Razorpay to live keys
9. Configure Sentry DSN + GA4 measurement ID
10. Run `npm run test:e2e` against staging before go-live

## Quick start (custom VPS + nginx)

See [SSL & HTTPS](./SSL-HTTPS.md) for Let's Encrypt + nginx config.

## Verify after deploy

```bash
# HTTPS redirect
curl -I http://preppylosers.com

# Security headers
curl -I https://preppylosers.com

# Compression (look for content-encoding: gzip)
curl -H "Accept-Encoding: gzip" -I https://preppylosers.com

# Health check
curl https://preppylosers.com/api/health

# Cache headers on static assets
curl -I https://preppylosers.com/_next/static/...
```

## Email notifications

Transactional email via **Resend** (welcome, order confirmation). See [Resend email](./RESEND-EMAIL.md).

Auth emails (magic link, etc.) are configured in Supabase Dashboard → Authentication → Email Templates.

## Google Sign-In

Configured via Supabase Auth + Google Cloud Console — not NextAuth. See [Google OAuth setup](./SUPABASE-GOOGLE-OAUTH.md).

## Legal pages

Privacy Policy, Terms, Refund, and Shipping policies are live at `/privacy-policy`, `/terms-and-conditions`, `/refund-policy`, `/shipping-policy`.
