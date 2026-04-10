-- Migration: Add availability status to barbers and email to appointments

-- Add availability status to barbers table
ALTER TABLE barbers 
ADD COLUMN available BOOLEAN DEFAULT TRUE;

-- Add email to appointments table
ALTER TABLE appointments 
ADD COLUMN customer_email VARCHAR(255);

-- Add notification_sent tracking
ALTER TABLE appointments 
ADD COLUMN notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN notification_channel VARCHAR(20);

-- Update indexes
CREATE INDEX idx_barbers_available ON barbers(available, shop_id);
CREATE INDEX idx_appointments_notification_sent ON appointments(notification_sent);
