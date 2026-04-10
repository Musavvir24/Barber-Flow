-- Add opening and closing times to shops table
ALTER TABLE shops ADD COLUMN opening_time TIME DEFAULT '09:00:00';
ALTER TABLE shops ADD COLUMN closing_time TIME DEFAULT '18:00:00';
ALTER TABLE shops ADD COLUMN country VARCHAR(100) DEFAULT 'India';
ALTER TABLE shops ADD COLUMN timezone VARCHAR(100) DEFAULT 'Asia/Kolkata';
