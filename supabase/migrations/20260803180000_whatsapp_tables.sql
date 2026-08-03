-- WhatsApp Business API message storage

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null unique,
  customer_name text,
  last_message text,
  last_message_at timestamptz,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.whatsapp_conversations (id) on delete set null,
  customer_phone text not null,
  message_id text unique,
  message_text text,
  direction text not null check (direction in ('inbound', 'outbound')),
  status text not null default 'pending' check (
    status in ('pending', 'sent', 'delivered', 'read', 'failed', 'received')
  ),
  template_name text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_messages_customer_phone_idx
  on public.whatsapp_messages (customer_phone, created_at desc);

create index if not exists whatsapp_messages_message_id_idx
  on public.whatsapp_messages (message_id)
  where message_id is not null;

create index if not exists whatsapp_conversations_last_message_at_idx
  on public.whatsapp_conversations (last_message_at desc nulls last);

alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;

-- Admin read access
create policy whatsapp_conversations_admin_select
  on public.whatsapp_conversations
  for select
  to authenticated
  using (public.is_admin());

create policy whatsapp_messages_admin_select
  on public.whatsapp_messages
  for select
  to authenticated
  using (public.is_admin());

-- Service role (webhook) bypasses RLS; no public insert policies needed.

create or replace function public.touch_whatsapp_conversation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger whatsapp_conversations_updated_at
  before update on public.whatsapp_conversations
  for each row
  execute function public.touch_whatsapp_conversation_updated_at();

create trigger whatsapp_messages_updated_at
  before update on public.whatsapp_messages
  for each row
  execute function public.touch_whatsapp_conversation_updated_at();
