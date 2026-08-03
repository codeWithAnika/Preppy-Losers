# Resend Email — PREPPY LOSERS

Transactional emails via [Resend](https://resend.com) for welcome, order confirmation, and admin alerts.

## Environment variables

Add to `.env.local` (dev) and Vercel Production:

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=loserspreppy@gmail.com
RESEND_ADMIN_EMAIL=loserspreppy@gmail.com
```

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Server-only API key from Resend dashboard |
| `RESEND_FROM_EMAIL` | Yes | Verified sender — currently `loserspreppy@gmail.com` |
| `RESEND_ADMIN_EMAIL` | No | New-order alerts (defaults to `loserspreppy@gmail.com`) |

**Never** prefix with `NEXT_PUBLIC_` — the API key must stay server-side.

All outgoing emails use `process.env.RESEND_FROM_EMAIL` as the Resend `from` field. The address is read in `lib/email/config.ts` → `getFromEmail()` and passed through `lib/email/resend.ts` → `sendEmail()`. Nothing is hardcoded in components or client code.

## Sender verification (required)

Before emails will send from `loserspreppy@gmail.com`:

1. Open [Resend Dashboard](https://resend.com/emails) → **Domains** or **Emails**
2. Add and verify `loserspreppy@gmail.com` as a sender (Resend sends a verification link to that inbox)
3. Until verified, Resend will reject sends from that address

Optional display name format (still set via env only):

```env
RESEND_FROM_EMAIL=PREPPY LOSERS <loserspreppy@gmail.com>
```

## Email triggers

| Email | When | Location |
|-------|------|----------|
| Welcome | Email signup with immediate session | `EmailAuthForm` → `/api/email/notify` |
| Welcome | OAuth / email confirm (new user) | `app/auth/callback/route.ts` |
| Order confirmation | After Razorpay verify succeeds | `CheckoutForm` → `/api/email/notify` |
| Admin new order | Same as order confirmation | Sent in parallel to `RESEND_ADMIN_EMAIL` |

Emails are **never** sent before payment verification completes.

## Architecture

```
lib/email/
  config.ts            — RESEND_API_KEY, RESEND_FROM_EMAIL (process.env)
  resend.ts              — Resend client; from: getFromEmail()
  notifications.ts       — welcome, order, admin helpers
  notify-client.ts         — client fire-and-forget (no secrets)
  templates/               — HTML email templates

app/api/email/notify/route.ts  — authenticated API route
app/api/email/test/route.ts    — dev-only test endpoint
```

## Test locally

```powershell
# 1. Ensure .env.local has:
#    RESEND_API_KEY=re_...
#    RESEND_FROM_EMAIL=loserspreppy@gmail.com

# 2. Restart dev server after env changes
npm run dev

# 3. Quick test (dev only) — sign in first, then:
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{"type":"order_confirmation"}'

# 4. Test welcome email — sign up at /signup (if Supabase auto-confirm enabled)

# 5. Full flow — complete a Razorpay test payment on /checkout
```

Check Resend dashboard → Emails for delivery logs and any sender verification errors.

## Production (Vercel)

1. Verify `loserspreppy@gmail.com` in Resend
2. Set env vars in Vercel → Settings → Environment Variables:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL=loserspreppy@gmail.com`
   - `RESEND_ADMIN_EMAIL=loserspreppy@gmail.com`
3. Redeploy

## Error handling

- Missing API key or from email: emails skipped, warning logged, order flow continues
- Resend API failure: logged, checkout still redirects to success
- `/api/email/notify` returns HTTP 200 for order emails so the client never blocks checkout
