-- Migration: Add geolocation columns to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add index for geospatial queries (if we use PostGIS later, but good for now)
CREATE INDEX IF NOT EXISTS idx_orders_latitude ON orders(latitude);
CREATE INDEX IF NOT EXISTS idx_orders_longitude ON orders(longitude);

COMMENT ON COLUMN orders.latitude IS 'Latitude of the delivery address';
COMMENT ON COLUMN orders.longitude IS 'Longitude of the delivery address';
