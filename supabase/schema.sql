-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price integer not null, -- stored in cents
  category_id uuid references categories(id) on delete set null,
  image_url text,
  images jsonb default '[]'::jsonb,
  stock integer default 0,
  modifiers jsonb default '[]'::jsonb,
  assembly_items jsonb default '[]'::jsonb,
  -- Rental-specific fields
  rental_price_daily integer, -- stored in cents
  rental_price_weekend integer, -- stored in cents
  rental_price_weekly integer, -- stored in cents
  quantity_available integer default 1,
  quantity_reserved integer default 0,
  minimum_rental_days integer default 1,
  setup_fee integer default 0, -- stored in cents
  sku text,
  weight decimal(10, 2),
  features jsonb default '[]'::jsonb,
  care_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Settings Table (for global configuration)
create table settings (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  total_amount integer not null, -- stored in cents
  subtotal integer, -- stored in cents
  tax_rate decimal(5, 4), -- percentage (e.g., 0.08875 for 8.875%)
  tax_amount integer, -- stored in cents
  delivery_fee integer default 0, -- stored in cents
  setup_fee integer default 0, -- stored in cents
  discount_amount integer default 0, -- stored in cents
  status text default 'pending',
  payment_status text default 'pending', -- pending, processing, succeeded, failed, refunded
  payment_intent_id text, -- Stripe payment intent ID
  payment_method text, -- card, bank_transfer, etc.
  stripe_customer_id text, -- For future recurring customers
  delivery_address text,
  delivery_time text,
  delivery_date date,
  delivery_notes text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price_at_time integer not null -- stored in cents
);

-- Content Table (for CMS)
create table content (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text,
  type text default 'text',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Rental Reservations Table (for availability tracking)
create table rental_reservations (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  quantity integer not null default 1,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quotes Table (for saved customer quotes)
create table quotes (
  id uuid default uuid_generate_v4() primary key,
  customer_name text,
  customer_email text,
  customer_phone text,
  event_date date,
  event_type text,
  venue_address text,
  cart_data jsonb not null,
  subtotal integer not null, -- stored in cents
  delivery_fee integer default 0, -- stored in cents
  setup_fee integer default 0, -- stored in cents
  total_amount integer not null, -- stored in cents
  status text default 'draft',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table products enable row level security;
alter table categories enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table content enable row level security;
alter table rental_reservations enable row level security;
alter table quotes enable row level security;

-- Products: Public read, Admin write
create policy "Public products are viewable by everyone."
  on products for select
  using ( true );

create policy "Users can insert their own products."
  on products for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own products."
  on products for update
  using ( auth.role() = 'authenticated' );

create policy "Users can delete their own products."
  on products for delete
  using ( auth.role() = 'authenticated' );

-- Categories: Public read, Admin write
create policy "Public categories are viewable by everyone."
  on categories for select
  using ( true );

create policy "Admins can insert categories."
  on categories for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update categories."
  on categories for update
  using ( auth.role() = 'authenticated' );

-- Settings: Public read, Admin write
create policy "Public settings are viewable by everyone."
  on settings for select
  using ( true );

create policy "Admins can update settings."
  on settings for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert settings."
  on settings for insert
  with check ( auth.role() = 'authenticated' );

-- Orders: Public can create (checkout), Admin can read/update
create policy "Anyone can create orders."
  on orders for insert
  with check ( true );

create policy "Admins can view all orders."
  on orders for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update orders."
  on orders for update
  using ( auth.role() = 'authenticated' );

-- Order Items
create policy "Admins can view all order items."
  on order_items for select
  using ( auth.role() = 'authenticated' );

-- Content: Public read, Admin write
create policy "Public content is viewable by everyone."
  on content for select
  using ( true );

create policy "Admins can update content."
  on content for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can insert content."
  on content for insert
  with check ( auth.role() = 'authenticated' );

-- Rental Reservations: Public read (for availability checking), Admin write
create policy "Public can view reservations for availability."
  on rental_reservations for select
  using ( true );

create policy "Admins can insert reservations."
  on rental_reservations for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update reservations."
  on rental_reservations for update
  using ( auth.role() = 'authenticated' );

-- Quotes: Public insert (customers can create), Admin read/update
create policy "Anyone can create quotes."
  on quotes for insert
  with check ( true );

create policy "Admins can view all quotes."
  on quotes for select
  using ( auth.role() = 'authenticated' );

create policy "Admins can update quotes."
  on quotes for update
  using ( auth.role() = 'authenticated' );

