-- Orders must only be created by post-payment fulfillment (service role RPC).
-- Prevents authenticated users from inserting fake "paid" orders via the client SDK.

drop policy if exists "Orders: users insert own" on public.orders;
