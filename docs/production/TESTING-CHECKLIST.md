# Testing Checklist — Production Launch

## Automated E2E (Playwright)

```bash
# Install browsers (first time)
npx playwright install

# Run against local dev server
npm run test:e2e

# Run against staging/production
PLAYWRIGHT_BASE_URL=https://preppylosers.com npm run test:e2e
```

Tests in `e2e/critical-flows.spec.ts`:
- Homepage, shop, login, signup load
- Legal pages accessible
- Health endpoint responds
- Checkout redirects unauthenticated users

### Extend for payment flow

Payment requires Razorpay test mode + authenticated user. Add when staging credentials are available:

```typescript
// e2e/checkout-payment.spec.ts (future)
test("complete test payment", async ({ page }) => {
  // login → add to cart → checkout → Razorpay test card
});
```

## Cross-browser checklist

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | [ ] Homepage, shop, checkout | [ ] Pixel / Chrome Android |
| Firefox | [ ] Homepage, shop, auth | — |
| Safari | [ ] Homepage, shop | [ ] iPhone Safari |
| Edge | [ ] Homepage, shop | — |

### Per-browser checks

- [ ] Page transitions work
- [ ] Razorpay modal opens on checkout
- [ ] Google Sign-In popup works
- [ ] Cart drawer opens/closes
- [ ] Images load (AVIF/WebP fallback)
- [ ] No console errors

## Slow connection testing

Chrome DevTools → Network → Throttling:

| Profile | Test |
|---------|------|
| Slow 3G | Homepage loads within 10s |
| Slow 3G | Shop product images lazy-load |
| High latency (200ms+) | Checkout form usable |
| Offline | Graceful error, no white screen |

Optimizations already in place:
- `next/image` with AVIF/WebP
- Font `display: swap`
- Static asset long-cache headers

## Load testing (k6)

```bash
# Install k6: https://k6.io/docs/get-started/installation/
k6 run scripts/load-test/k6-smoke.js
```

Start with smoke test (50 VUs), then ramp to 1000 VUs on staging only.

**Do not load test production without warning your host.**

### Interpreting results

- p95 response time < 2s for static pages
- Error rate < 1%
- No 429 rate limit errors under normal traffic patterns
- Supabase connection pool not exhausted

## Email notification testing

| Email | Provider | Status |
|-------|----------|--------|
| Welcome / confirm signup | Supabase Auth templates | Configure in Supabase Dashboard |
| Password reset | Supabase Auth templates | Configure in Supabase Dashboard |
| Order confirmation | Not implemented | Requires Resend/SendGrid integration |

### Supabase email template testing

1. Supabase Dashboard → Authentication → Email Templates
2. Customize Confirm signup, Reset password, Magic link
3. Send test from dashboard
4. Verify: renders on mobile, links work, brand matches PREPPY LOSERS

## Manual critical flows

- [ ] Sign up with email
- [ ] Sign in with Google
- [ ] Sign in with phone OTP
- [ ] Browse shop → select size → add to cart
- [ ] Checkout → Razorpay test payment → order in account
- [ ] Admin dashboard (allowlisted user only)
- [ ] Sign out
- [ ] Legal pages load from footer links

## Performance targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | < 800ms |

Measure with Lighthouse (mobile) and PageSpeed Insights on production URL.
