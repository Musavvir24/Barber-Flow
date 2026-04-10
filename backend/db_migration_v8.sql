-- Migration V8: Add premium subscription expiration tracking
-- This adds premium_expires_at column to track when a paid subscription ends
-- Subscriptions are valid for 30 days from purchase date

ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP;

-- Create index on premium_expires_at for faster queries when checking expired subscriptions
CREATE INDEX IF NOT EXISTS idx_shops_premium_expires_at ON shops(premium_expires_at);
