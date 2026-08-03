# WhatsApp Business API — PREPPY LOSERS

## Architecture

| File | Purpose |
|------|---------|
| `lib/whatsapp.ts` | Main exports (`sendWhatsAppMessage`, `sendTemplateMessage`) |
| `lib/whatsapp/client.ts` | Meta Graph API calls |
| `lib/whatsapp/db.ts` | Supabase persistence |
| `lib/whatsapp/notifications.ts` | Welcome + order confirmation helpers |
| `app/api/whatsapp/webhook/route.ts` | Meta webhook (GET verify + POST messages) |
| `app/api/whatsapp/notify/route.ts` | Authenticated outbound triggers |
| `components/WhatsAppButton.tsx` | wa.me link in footer |

> This project uses **App Router** (`app/api/.../route.ts`), not `pages/api/`. Functionality matches your spec.

## 1. Apply database migration

```powershell
npx supabase db push
```

Creates `whatsapp_messages` and `whatsapp_conversations` tables.

## 2. Environment variables

Set in Vercel → Settings → Environment Variables (Production):

```env
WHATSAPP_PHONE_ID=1172819232592440
WHATSAPP_BUSINESS_ID=1535675991370053
WHATSAPP_ACCESS_TOKEN=<your-token>
WHATSAPP_VERIFY_TOKEN=preppy_losers_secret_token_123
WHATSAPP_APP_SECRET=<from Meta App Dashboard>
WHATSAPP_WA_ME_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_WA_ME_NUMBER=91XXXXXXXXXX
WHATSAPP_WELCOME_TEMPLATE=welcome_message
WHATSAPP_ORDER_TEMPLATE=order_confirmation
SUPABASE_SERVICE_ROLE_KEY=<required for webhook DB writes>
```

**Security:** Rotate `WHATSAPP_ACCESS_TOKEN` if it was ever exposed. Never commit tokens to git.

## 3. Meta webhook setup

1. [Meta for Developers](https://developers.facebook.com/) → Your App → WhatsApp → Configuration
2. **Callback URL:** `https://preppylosers.com/api/whatsapp/webhook`
3. **Verify token:** `preppy_losers_secret_token_123`
4. Subscribe to: `messages`, `message_status`
5. Copy **App Secret** → `WHATSAPP_APP_SECRET` (required for POST signature verification in production)

## 4. Message templates

Create and get approved in Meta Business Manager → WhatsApp → Message templates:

### `welcome_message` (English)
```
Welcome to PREPPY LOSERS, {{1}}! You're now part of the underground. We'll notify you about drops and orders here.
```

### `order_confirmation` (English)
```
Hi {{1}}, your PREPPY LOSERS order {{2}} is confirmed. Amount: ₹{{3}}. We'll message you when it ships.
```

If templates aren't approved yet, the app falls back to plain text messages (only works within 24h user-initiated window or for test numbers).

## 5. Deploy to Vercel

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect GitHub repo in Vercel dashboard → auto-deploy on push to `main`.

After deploy:
1. Confirm webhook verification in Meta dashboard (green checkmark)
2. Send a test message to your business number
3. Check Supabase → `whatsapp_messages` table

## 6. Test webhook locally with ngrok

```powershell
# Terminal 1 — dev server
npm run dev

# Terminal 2 — ngrok tunnel
ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok-free.app`) and set in Meta temporarily:

- **Callback URL:** `https://abc123.ngrok-free.app/api/whatsapp/webhook`
- **Verify token:** `preppy_losers_secret_token_123`

Add to `.env.local`:

```env
WHATSAPP_PHONE_ID=1172819232592440
WHATSAPP_ACCESS_TOKEN=<your-token>
WHATSAPP_VERIFY_TOKEN=preppy_losers_secret_token_123
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Verify GET challenge

```powershell
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=preppy_losers_secret_token_123&hub.challenge=test123"
# Expected: test123
```

### Test outbound message (server)

```typescript
import { sendWhatsAppMessage } from "@/lib/whatsapp";

await sendWhatsAppMessage("919876543210", "Test from PREPPY LOSERS");
```

## 7. Automatic notifications

| Event | Trigger |
|-------|---------|
| Welcome message | Phone signup after name saved (`PhoneOtpForm`) |
| Order confirmation | After successful Razorpay payment (`CheckoutForm`) |

Both call `POST /api/whatsapp/notify` (requires authenticated session).

## 8. WhatsAppButton

Footer includes a wa.me link when `NEXT_PUBLIC_WHATSAPP_WA_ME_NUMBER` is set:

```tsx
<WhatsAppButton phoneNumber="919876543210" message="Hi PREPPY LOSERS!" />
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Webhook verify fails | Check `WHATSAPP_VERIFY_TOKEN` matches Meta dashboard exactly |
| POST returns 401 | Set `WHATSAPP_APP_SECRET` from Meta App settings |
| Template send fails | Ensure template name/language approved in Business Manager |
| Messages not in DB | Check `SUPABASE_SERVICE_ROLE_KEY` and run migration |
| wa.me button hidden | Set `NEXT_PUBLIC_WHATSAPP_WA_ME_NUMBER` |
