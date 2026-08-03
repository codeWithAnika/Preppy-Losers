# Rollback Procedure

If a production deploy causes critical issues, follow these steps in order.

## Severity levels

| Level | Example | Action |
|-------|---------|--------|
| P0 | Site down, payments broken | Immediate rollback |
| P1 | Auth broken, checkout errors | Rollback within 15 min |
| P2 | UI bug, non-critical | Hotfix forward |

## Vercel rollback (fastest — ~30 seconds)

1. Vercel Dashboard → Project → Deployments
2. Find last known-good deployment
3. Click **⋯ → Promote to Production**
4. Verify: `curl https://preppylosers.com/api/health`
5. Test checkout with Razorpay test card

## Git rollback (redeploy previous commit)

```bash
git log --oneline -5
git revert HEAD --no-edit   # preferred: preserves history
git push origin main
# Vercel auto-deploys the revert
```

Or hard reset (use only if revert is messy):

```bash
git reset --hard <good-commit-sha>
git push --force-with-lease origin main
```

## Database rollback

If a bad migration was applied:

1. **Do not** run random DROP commands
2. Restore from latest backup (see [DATABASE.md](./DATABASE.md))
3. Or apply a reverse migration SQL file

```bash
npx supabase db execute --linked -f supabase/migrations/ROLLBACK_xxx.sql
```

## Edge function rollback

```bash
# Redeploy previous version from git
git checkout <good-commit> -- supabase/functions/
npx supabase functions deploy create-razorpay-order
npx supabase functions deploy verify-razorpay-payment
npx supabase functions deploy razorpay-webhook
```

## Razorpay key rollback

If live keys were misconfigured:

1. Switch `NEXT_PUBLIC_RAZORPAY_KEY_ID` back to last working key in Vercel env
2. Update Supabase secrets to matching key pair
3. Redeploy

## Post-rollback checklist

- [ ] `/api/health` returns `ok`
- [ ] Homepage and shop load
- [ ] Login works
- [ ] Test payment completes
- [ ] Sentry error rate drops
- [ ] Notify team in Slack
- [ ] Write incident note: what broke, root cause, fix plan

## Communication template

> PREPPY LOSERS — Incident Update
> We identified an issue with [description] and rolled back to the previous stable version at [time IST].
> The site is operational. Orders placed during [window] may need review.
> Contact: loserspreppy@gmail.com

## Prevent future rollbacks

- Deploy to staging/preview first
- Run `npm run test:e2e` before promoting
- Apply DB migrations to staging 24h before production
- Use feature flags for risky changes (future)
