# Monitoring, Alerts & Uptime

## Health endpoint

`GET /api/health` returns:

```json
{ "status": "ok", "checks": { "database": "ok" }, "timestamp": "..." }
```

Returns `503` if Supabase is unreachable. Use for uptime probes.

## Sentry (errors + session replay + performance)

### Setup

1. Create project at [sentry.io](https://sentry.io) → Next.js
2. Set env vars:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...
   SENTRY_DSN=https://...@....ingest.sentry.io/...
   SENTRY_TRACES_SAMPLE_RATE=0.1
   SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
   ```
3. Deploy — errors auto-capture via `instrumentation.ts` and `app/global-error.tsx`

### Alerts in Sentry

- **Issues → Alert Rules → New Alert**
- Critical: error count > 10 in 5 min → Email + Slack
- Performance: p95 LCP > 4s → Email
- Replay: on error (already 100% via `replaysOnErrorSampleRate: 1.0`)

### Slack integration

Sentry → Settings → Integrations → Slack → connect `#preppy-losers-alerts`

## Google Analytics 4

1. Create GA4 property for `preppylosers.com`
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
3. Custom events available via `components/analytics/GoogleAnalytics.tsx`:
   - `sign_up`, `login`, `add_to_cart`, `begin_checkout`, `purchase`

### Key conversions (GA4 Admin → Events → Mark as conversion)

- `purchase`
- `sign_up`
- `begin_checkout`

## Structured logging

Server logs emit JSON via `lib/logging/logger.ts`. On Vercel, view in **Functions → Logs**. For persistent storage:

- **Supabase**: log table + edge function (future)
- **Axiom / Logtail / Datadog**: pipe Vercel log drain

Example log query (Axiom): `category == "api" and statusCode >= 500`

## Uptime monitoring

### Option A: Better Uptime / Pingdom

Monitor: `https://preppylosers.com/api/health`
- Interval: 1 min
- Alert: email + SMS on 2 consecutive failures
- Also monitor: `https://preppylosers.com/` (200 OK)

### Option B: UptimeRobot (free tier)

- HTTP(s) monitor on `/api/health`
- Keyword monitor: `"status":"ok"` in response body

### Status page

- [Better Stack Status Page](https://betterstack.com/status) or [Instatus](https://instatus.com)
- Components: Website, Checkout, Payments (Razorpay), Database (Supabase)
- Subscribe link in footer (future)

## Alert matrix

| Condition | Tool | Channel |
|-----------|------|---------|
| Unhandled JS/server error | Sentry | Slack + email |
| API 5xx spike | Sentry / log drain | Slack |
| Database unreachable | `/api/health` uptime monitor | SMS + email |
| Site down (homepage) | UptimeRobot | SMS + email |
| Payment webhook failures | Supabase edge logs + Sentry | Slack |

## Supabase monitoring

Supabase Dashboard → Reports:
- Database health, connection count, slow queries
- Enable **Database Webhooks** or log drain for connection drop alerts

Set alert when active connections > 80% of pool limit.
