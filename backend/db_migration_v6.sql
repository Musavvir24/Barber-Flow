-- Add phone and country_code fields to users table for owner contact info
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(5);
