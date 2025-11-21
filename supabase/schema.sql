-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  category_id uuid references categories(id) on delete set null,
  image_url text,
  images jsonb default '[]'::jsonb,
  stock integer default 0,
  modifiers jsonb default '[]'::jsonb,
  assembly_items jsonb default '[]'::jsonb,
  -- Rental-specific fields
  rental_price_daily decimal(10, 2),
  rental_price_weekend decimal(10, 2),
  rental_price_weekly decimal(10, 2),
  quantity_available integer default 1,
  quantity_reserved integer default 0,
  minimum_rental_days integer default 1,
  setup_fee decimal(10, 2) default 0,
  sku text,
  weight decimal(10, 2),
  features jsonb default '[]'::jsonb,
  care_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  total_amount decimal(10, 2) not null,
  status text default 'pending',
  delivery_address text,
  delivery_time text,
  delivery_date date,
  delivery_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price_at_time decimal(10, 2) not null
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
  subtotal decimal(10, 2) not null,
  delivery_fee decimal(10, 2) default 0,
  setup_fee decimal(10, 2) default 0,
  total_amount decimal(10, 2) not null,
  status text default 'draft',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table products enable row level security;
alter table categories enable row level security;
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

-- Orders: Admin read/write (and potentially user own orders if we had user auth for customers)
-- For now, assuming only admins manage orders
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

