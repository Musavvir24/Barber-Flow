-- Add trial and premium columns to shops table
ALTER TABLE shops ADD COLUMN trial_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE shops ADD COLUMN trial_ends_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes');
ALTER TABLE shops ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE shops ADD COLUMN upgrade_date TIMESTAMP;

-- Create a payments table to track upgrade transactions
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
