# Payment System Test Checklist

Use **test mode** keys and Razorpay test instruments unless explicitly testing live.

## Setup before testing

- [ ] Migrations applied (`20260731140000` through `20260731160000`)
- [ ] Edge functions deployed (`create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`)
- [ ] Supabase secrets set: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches `RAZORPAY_KEY_ID` (same test/live mode)
- [ ] Webhook URL configured in Razorpay Dashboard

## Single item checkout

- [ ] Add one product (one size) to cart
- [ ] Complete checkout with valid address
- [ ] Razorpay modal opens with correct amount
- [ ] Pay with UPI test `success@razorpay`
- [ ] Redirect to `/account?order=success`
- [ ] Order appears in account with status `paid`
- [ ] Stock decremented by 1
- [ ] `payment_sessions.status` = `fulfilled`

## Multiple items checkout

- [ ] Add 2+ line items (different products or sizes)
- [ ] Complete payment
- [ ] Multiple rows in `orders` with same `razorpay_payment_id`
- [ ] Each line item stock decremented correctly

## UPI

- [ ] UPI `success@razorpay` → success
- [ ] UPI failure test (if available) → "Payment failed" shown

## Cards

- [ ] Indian test card `4111 1111 1111 1111` → success
- [ ] International card → Razorpay modal error (not verify error)

## Pay Later

- [ ] Pay Later method completes
- [ ] Verify + webhook both idempotent (no duplicate orders)

## Failed payment

- [ ] Trigger card decline / failed test
- [ ] User sees "Payment failed"
- [ ] No order created
- [ ] `payment_sessions.status` = `failed` (via webhook)

## Cancelled payment

- [ ] Open Razorpay modal and close without paying
- [ ] User sees "Payment cancelled"
- [ ] Pay button re-enabled
- [ ] No order created

## Duplicate payment verification

- [ ] Complete successful payment
- [ ] Replay verify request with same payment IDs
- [ ] Response: success + `duplicate: true`
- [ ] Stock not decremented again
- [ ] No extra order rows

## Expired JWT

- [ ] Start checkout with valid session
- [ ] Expire/sign out in another tab
- [ ] Attempt pay → redirect to login or "session expired"

## Stock race condition

- [ ] Set product stock to 1
- [ ] Two users checkout same size concurrently
- [ ] Only one succeeds; other gets "Out of stock"
- [ ] Failed user not charged OR support refund if charged

## Out of stock

- [ ] Add last unit to cart
- [ ] Admin sets stock to 0 before verify
- [ ] Payment completes but verify returns out of stock
- [ ] Manual refund if needed

## Network timeout

- [ ] Simulate 503 on verify (or throttle network)
- [ ] Client retries up to 3 times
- [ ] User sees "Server unavailable" if all retries fail
- [ ] Webhook still fulfills if payment captured

## Webhook retry

- [ ] Complete payment, block client verify (devtools offline after pay)
- [ ] Razorpay webhook fires `payment.captured`
- [ ] Order created via webhook
- [ ] Resend same webhook from Dashboard → idempotent, no duplicate stock loss

## Refund (webhook)

- [ ] Refund payment in Razorpay Dashboard
- [ ] `payment.refunded` webhook received
- [ ] Orders marked `refunded`

## Security

- [ ] Client cannot `insert` into `orders` via Supabase SDK (RLS denied)
- [ ] Tampered cart amount rejected at order create
- [ ] Tampered verify signature rejected
- [ ] Wrong user's payment session rejected at verify

## Logs (Supabase Edge Function logs)

- [ ] `Creating Razorpay order` logged
- [ ] `Verifying signature` logged
- [ ] `Calling fulfill_paid_order RPC` logged
- [ ] `Webhook received` / `Webhook verified` / `Webhook fulfilled` logged
- [ ] Errors include structured JSON with scope + message
