-- Bootstrap catalog tables for a fresh Supabase project (plux-compatible).
-- Safe to re-run. Creates only what the public catalog + importer need.

create extension if not exists "uuid-ossp";

do $$ begin
  create type public.inventory_status as enum (
    'available',
    'rented',
    'maintenance',
    'damaged',
    'retired'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null,
  slug varchar not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default current_timestamp
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null,
  slug varchar not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  sku varchar not null unique,
  price_cents integer not null,
  cost_cents integer,
  weight numeric,
  dimensions_length numeric,
  dimensions_width numeric,
  dimensions_height numeric,
  setup_time integer,
  requires_special_handling boolean default false,
  minimum_rental_period integer default 1,
  image_url varchar,
  gallery_images text[],
  specifications jsonb,
  is_active boolean default true,
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp,
  quantity_available integer default 1,
  quantity_reserved integer default 0
);

create table if not exists public.inventory (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  serial_number varchar unique,
  status public.inventory_status default 'available',
  condition_notes text,
  purchase_date date,
  last_maintenance_date date,
  next_maintenance_date date,
  location varchar,
  created_at timestamptz default current_timestamp,
  updated_at timestamptz default current_timestamp
);

create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_inventory_product_id on public.inventory (product_id);
create index if not exists idx_inventory_status on public.inventory (status);

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.inventory enable row level security;

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

grant select on public.products to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.inventory to authenticated;
