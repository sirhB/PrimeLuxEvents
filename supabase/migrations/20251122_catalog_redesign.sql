-- Add featured flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add image_url and featured flag to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- stored in cents
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create package_items table
CREATE TABLE IF NOT EXISTS package_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1
);

-- Enable RLS for new tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Public packages are viewable by everyone."
  ON packages FOR SELECT
  USING ( true );

CREATE POLICY "Admins can insert packages."
  ON packages FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can update packages."
  ON packages FOR UPDATE
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can delete packages."
  ON packages FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- RLS Policies for package_items
CREATE POLICY "Public package items are viewable by everyone."
  ON package_items FOR SELECT
  USING ( true );

CREATE POLICY "Admins can insert package items."
  ON package_items FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can update package items."
  ON package_items FOR UPDATE
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Admins can delete package items."
  ON package_items FOR DELETE
  USING ( auth.role() = 'authenticated' );
