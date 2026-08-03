# CDN & Static Asset Caching

## Option A: Vercel (built-in CDN)

Vercel edge network caches static assets automatically.

**Headers already configured in `next.config.mjs`:**
- `/_next/static/*` → `Cache-Control: public, max-age=31536000, immutable`
- Public files (svg, png, webp, fonts) → `max-age=86400, stale-while-revalidate=604800`
- ETags enabled via `generateEtags: true`

**Image optimization:** Next.js Image component serves AVIF/WebP via `/_next/image`. Config in `next.config.mjs`:
- `formats: ["image/avif", "image/webp"]`
- `minimumCacheTTL: 86400`

No extra Vercel config needed for basic caching.

## Option B: Cloudflare (in front of Vercel or VPS)

### Page Rules / Cache Rules

| Pattern | Cache level | Edge TTL |
|---------|-------------|----------|
| `preppylosers.com/_next/static/*` | Cache Everything | 1 year |
| `preppylosers.com/*.webp` | Cache Everything | 1 day |
| `preppylosers.com/*.png` | Cache Everything | 1 day |
| `preppylosers.com/api/*` | Bypass | — |
| `preppylosers.com/account/*` | Bypass | — |
| `preppylosers.com/checkout/*` | Bypass | — |

### Cloudflare dashboard steps

1. **Caching → Configuration** → Browser Cache TTL: Respect Existing Headers
2. **Speed → Optimization** → Auto Minify: JS, CSS, HTML
3. **Speed → Optimization** → Polish: Lossless (for product images)
4. **Network** → HTTP/2 and HTTP/3: ON
5. **Network** → Brotli: ON (Cloudflare compresses at edge; Next.js gzip still applies at origin)

### Purge cache on deploy

```bash
# Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

Or purge by prefix: `/_next/static/`

## Verify caching

```bash
curl -I https://preppylosers.com/_next/static/chunks/main-app.js
# Look for: cache-control: public, max-age=31536000, immutable
# Look for: etag: "..."

curl -I https://preppylosers.com/logo-badge.webp
# Look for: cache-control: public, max-age=86400, stale-while-revalidate=604800
```

## Supabase storage images

Product images from `*.supabase.co` are optimized via Next.js `<Image>` with remote patterns configured. Cloudflare does not cache Supabase URLs unless you proxy them through your domain (optional advanced setup).
