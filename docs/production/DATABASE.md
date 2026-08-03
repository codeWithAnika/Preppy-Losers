# Database — Backups, Pooling, Migrations

## Connection pooling

Supabase includes **Supavisor** connection pooling by default.

| Use case | Connection string |
|----------|-------------------|
| App (Next.js server) | `NEXT_PUBLIC_SUPABASE_URL` (pooler on port 6543 for transaction mode) |
| Migrations / admin | Direct connection (port 5432) via Supabase CLI |
| Edge functions | Built-in Supabase client (pooled) |

For high traffic, use the **transaction pooler** URL from Supabase Dashboard → Settings → Database → Connection string → Transaction pooler.

No additional pooling config needed in Next.js — `@supabase/ssr` uses the project URL.

### Monitor connections

Supabase Dashboard → Reports → Database
- Alert when active connections > 80% of limit
- Upgrade compute tier if sustained high usage

## Daily automated backups

### Option A: Supabase Pro (recommended)

Supabase Pro includes daily backups with point-in-time recovery (PITR). Enable in Dashboard → Settings → Database → Backups.

### Option B: Manual / scripted backup

```powershell
# scripts/backup-supabase.ps1
# Requires: supabase CLI logged in, project linked

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = "backups"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

npx supabase db dump --linked -f "$outDir/preppy-losers-$timestamp.sql"

Write-Host "Backup saved to $outDir/preppy-losers-$timestamp.sql"
```

Schedule via Windows Task Scheduler or cron on Linux:

```bash
0 2 * * * /path/to/scripts/backup-supabase.sh
```

Upload backups to S3 / Google Cloud Storage for off-site retention.

### Restore

```powershell
# scripts/restore-supabase.ps1
# WARNING: Destructive — restores over existing data. Test on staging first.

param([Parameter(Mandatory=$true)][string]$BackupFile)

npx supabase db reset --linked
Get-Content $BackupFile | npx supabase db execute --linked
```

**Always test restore on a staging project before relying on backups.**

## Production indexes

Migration `20260803140000_production_indexes.sql` adds indexes for:
- Order history by user
- Admin order filtering by status
- Razorpay order ID lookup
- Active product queries
- Default address lookup

Apply: `npx supabase db push`

## Slow query analysis

```sql
-- Enable pg_stat_statements in Supabase (Dashboard → Database → Extensions)
SELECT
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

Common queries to watch:
- `orders` filtered by `user_id`
- `products` where `is_active = true`
- `profiles` role checks

## Zero-downtime migration strategy

1. **Additive changes first** — add columns/tables with defaults, deploy code that reads both old and new
2. **Backfill data** — run migration SQL or script
3. **Deploy code** that writes to new schema
4. **Remove old columns** in a follow-up migration (after confirming no rollback needed)

### Safe migration workflow

```bash
# 1. Test migration on staging
npx supabase db push --db-url $STAGING_DB_URL

# 2. Run app against staging, verify

# 3. Apply to production during low traffic
npx supabase db push

# 4. Monitor Sentry + /api/health for 15 min
```

### Rollback a migration

Supabase does not auto-rollback. Write a reverse migration SQL file and apply manually, or restore from backup.

## Schema change checklist

- [ ] Migration tested on staging
- [ ] RLS policies updated if new tables/columns
- [ ] Types regenerated: `npm run gen:types`
- [ ] No breaking changes to edge functions
- [ ] Backup taken before production apply
