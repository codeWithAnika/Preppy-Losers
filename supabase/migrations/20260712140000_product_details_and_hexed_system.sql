-- Product details field + active drop client copy (drop-02 / HEXED SYSTEM)

alter table public.products
  add column if not exists details text;

update public.products
set
  name = 'HEXED SYSTEM',
  description = 'Engineered for the streets.',
  price = 859,
  details = E'260 GSM Heavyweight Cotton
100% Cotton Fabric
Premium Screen Print
Crop Boxy Fit'
where id = 'drop-02'
  and is_active = true;
