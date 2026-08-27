-- Launch-ready: allow public catalog reads on plux
-- Run this in Supabase Dashboard → SQL Editor for project "plux"

alter table public.products enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products
  for select
  to anon, authenticated
  using (coalesce(is_active, true) = true);

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
  on public.categories
  for select
  to anon, authenticated
  using (coalesce(is_active, true) = true);

-- Optional: authenticated staff can write (adjust if you use custom roles)
drop policy if exists "Authenticated can write products" on public.products;
create policy "Authenticated can write products"
  on public.products
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can write categories" on public.categories;
create policy "Authenticated can write categories"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);
