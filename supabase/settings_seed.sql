-- Seed settings table with initial configuration values
insert into settings (key, value, description) values
  ('tax_rate', '0.08875', 'Sales tax rate (decimal, e.g., 0.08875 for 8.875%)'),
  ('delivery_base_fee', '5000', 'Base delivery fee in cents'),
  ('delivery_per_mile_rate', '150', 'Delivery cost per mile in cents'),
  ('warehouse_address', '123 Main St, New York, NY 10001', 'Warehouse address for delivery distance calculation')
on conflict (key) do nothing;
