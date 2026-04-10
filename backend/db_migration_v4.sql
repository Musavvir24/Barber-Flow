-- Add gateway column to payments table for tracking payment provider
ALTER TABLE payments 
ADD COLUMN gateway VARCHAR(50) DEFAULT 'razorpay';
