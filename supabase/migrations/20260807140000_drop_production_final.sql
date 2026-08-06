-- Production final: drop metadata + remove legacy products.drop_number
-- Reversible: see rollback section at bottom

-- ---------------------------------------------------------------------------
-- Future-proof drop metadata
-- ---------------------------------------------------------------------------
alter table public.drops
  add column if not exists display_order integer not null default 0,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists featured boolean not null default false,
  add column if not exists theme_color text,
  add column if not exists visibility text not null default 'public';

alter table public.drops drop constraint if exists drops_visibility_check;
alter table public.drops
  add constraint drops_visibility_check
  check (visibility in ('public', 'hidden', 'unlisted'));

create index if not exists drops_listed_idx
  on public.drops (is_active, status, visibility, display_order desc);

comment on column public.drops.display_order is 'Manual sort for shop/homepage listings (higher first).';
comment on column public.drops.starts_at is 'Optional scheduled go-live (UTC).';
comment on column public.drops.ends_at is 'Optional scheduled end (UTC).';
comment on column public.drops.featured is 'Highlight on homepage when listed.';
comment on column public.drops.theme_color is 'Optional accent for future drop theming.';
comment on column public.drops.visibility is 'public=listed, hidden=admin only, unlisted=direct URL only.';

-- ---------------------------------------------------------------------------
-- Remove legacy denormalized column from products (drop_id is canonical)
-- ---------------------------------------------------------------------------
alter table public.products drop column if exists drop_number;

-- ---------------------------------------------------------------------------
-- ROLLBACK (run manually if reverting this migration):
-- alter table public.products add column if not exists drop_number integer;
-- update public.products p set drop_number = d.drop_number from public.drops d where p.drop_id = d.id;
-- alter table public.drops drop column if exists display_order;
-- alter table public.drops drop column if exists starts_at;
-- alter table public.drops drop column if exists ends_at;
-- alter table public.drops drop column if exists featured;
-- alter table public.drops drop column if exists theme_color;
-- alter table public.drops drop column if exists visibility;
