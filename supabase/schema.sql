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
  stock integer default 0,
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

-- RLS Policies

-- Enable RLS
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table content enable row level security;

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
