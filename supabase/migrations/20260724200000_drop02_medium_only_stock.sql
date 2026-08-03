-- HEXED SYSTEM (drop-02): only Medium in stock for current drop run
update public.products
set size_stock = '[
  {"size": "XS", "stock": 0},
  {"size": "S",  "stock": 0},
  {"size": "M",  "stock": 30},
  {"size": "L",  "stock": 0},
  {"size": "XL", "stock": 0}
]'::jsonb
where id = 'drop-02';
