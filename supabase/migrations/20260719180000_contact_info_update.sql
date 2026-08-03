-- Update live store contact details (support email + Instagram profile URL).
update public.store_settings
set
  settings = jsonb_set(
    jsonb_set(
      settings,
      '{supportEmail}',
      '"Loserspreppy@gmail.com"'::jsonb
    ),
    '{socialLinks,instagram}',
    '"https://www.instagram.com/preppylosers"'::jsonb
  ),
  updated_at = now()
where id = 1;
