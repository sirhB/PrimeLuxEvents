-- Migration: Add Package Configurability
-- Description: Adds support for configurable package items and discounts

-- 1. Add discount fields to packages table
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS discount_type text CHECK (discount_type IN ('percentage', 'fixed_amount')),
ADD COLUMN IF NOT EXISTS discount_value integer DEFAULT 0, -- percentage (0-100) or amount in cents
ADD COLUMN IF NOT EXISTS original_price integer, -- calculated sum of all items in cents
ADD COLUMN IF NOT EXISTS savings_amount integer; -- calculated savings in cents

-- 2. Create package_item_groups table
-- This allows grouping items like "Choose Your Linens" or "Select Centerpieces"
CREATE TABLE IF NOT EXISTS package_item_groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  min_selections integer DEFAULT 1,
  max_selections integer DEFAULT 1,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create package_item_options table
-- These are the actual products available within a group
CREATE TABLE IF NOT EXISTS package_item_options (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES package_item_groups(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  quantity integer DEFAULT 1, -- How many of this product are included in this option
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE package_item_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_item_options ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for package_item_groups
CREATE POLICY "Public package item groups are viewable by everyone."
  ON package_item_groups FOR SELECT
  USING ( true );

CREATE POLICY "Admins can insert package item groups."
  ON package_item_groups FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can update package item groups."
  ON package_item_groups FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can delete package item groups."
  ON package_item_groups FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- 6. RLS Policies for package_item_options
CREATE POLICY "Public package item options are viewable by everyone."
  ON package_item_options FOR SELECT
  USING ( true );

CREATE POLICY "Admins can insert package item options."
  ON package_item_options FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can update package item options."
  ON package_item_options FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can delete package item options."
  ON package_item_options FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );
