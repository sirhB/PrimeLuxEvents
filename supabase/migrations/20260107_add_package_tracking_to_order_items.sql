-- Add package tracking to order items
alter table order_items add column package_id uuid references packages(id);
alter table order_items add column package_name text;
alter table order_items add column bundle_id uuid; -- To group items from the same package instance
