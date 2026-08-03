# SSL & HTTPS

## Vercel (recommended)

Vercel provisions and renews TLS certificates automatically. No cert paths needed.

1. Add `preppylosers.com` and `www.preppylosers.com` in Vercel → Domains
2. Point DNS A/CNAME records to Vercel
3. Set env: `FORCE_HTTPS=true`, `NEXT_PUBLIC_SITE_URL=https://preppylosers.com`
4. Redirect `www` → apex in Vercel domain settings

## Cloudflare

1. Add site to Cloudflare, update nameservers
2. SSL/TLS mode: **Full (strict)**
3. Enable **Always Use HTTPS** (Edge Certificates → SSL/TLS → Edge Certificates)
4. Enable **Automatic HTTPS Rewrites**
5. Set env on origin: `FORCE_HTTPS=true`

## Custom server (nginx + Let's Encrypt)

### 1. Obtain certificate

```bash
sudo certbot certonly --nginx -d preppylosers.com -d www.preppylosers.com
```

Certs default to:
- `/etc/letsencrypt/live/preppylosers.com/fullchain.pem`
- `/etc/letsencrypt/live/preppylosers.com/privkey.pem`

### 2. Environment variables

```env
SSL_CERT_PATH=/etc/letsencrypt/live/preppylosers.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/preppylosers.com/privkey.pem
SSL_CA_PATH=/etc/letsencrypt/live/preppylosers.com/chain.pem
FORCE_HTTPS=true
```

See `deploy/nginx/preppylosers.conf` for nginx config.

### 3. Verify HTTPS redirect

```bash
curl -I http://preppylosers.com
# Expect: HTTP/1.1 308 Permanent Redirect
# Location: https://preppylosers.com/
```

### 4. Verify assets load over HTTPS

Open DevTools → Network. Confirm no mixed-content warnings. All scripts, images, and API calls should use `https://`.

### 5. HSTS

HSTS is set automatically when `NODE_ENV=production` via middleware and `next.config.mjs`. Preload submission: https://hstspreload.org/ (after stable HTTPS for 30+ days).

## Renewal

```bash
sudo certbot renew --dry-run
```

Add cron: `0 3 * * * certbot renew --quiet && systemctl reload nginx`
