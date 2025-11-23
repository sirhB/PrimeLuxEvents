-- Create product_images table
create table if not exists product_images (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer default 0,
  modifier_id text, -- e.g. "color"
  option_id text,   -- e.g. "gold"
  created_at timestamptz default now()
);

-- Enable RLS
alter table product_images enable row level security;

-- Create policies
create policy "Public read access"
  on product_images for select
  using (true);

create policy "Admin full access"
  on product_images for all
  using (auth.role() = 'service_role');
