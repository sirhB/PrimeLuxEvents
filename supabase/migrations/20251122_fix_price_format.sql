-- Fix product prices that are stored in dollars instead of cents
-- This migration multiplies all prices by 100 to convert them to cents
-- Only updates prices that appear to be in dollar format (less than 1000)

-- Update main price field
UPDATE products 
SET price = price * 100 
WHERE price < 1000;

-- Update rental price fields
UPDATE products 
SET rental_price_daily = rental_price_daily * 100 
WHERE rental_price_daily IS NOT NULL AND rental_price_daily < 1000;

UPDATE products 
SET rental_price_weekend = rental_price_weekend * 100 
WHERE rental_price_weekend IS NOT NULL AND rental_price_weekend < 1000;

UPDATE products 
SET rental_price_weekly = rental_price_weekly * 100 
WHERE rental_price_weekly IS NOT NULL AND rental_price_weekly < 1000;

-- Update setup fee
UPDATE products 
SET setup_fee = setup_fee * 100 
WHERE setup_fee IS NOT NULL AND setup_fee < 1000;

-- Update package prices
UPDATE packages 
SET price = price * 100 
WHERE price < 1000;
