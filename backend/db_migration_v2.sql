-- Migration v2: Add gap time and barber-service relationship

-- Add gap time to services table
ALTER TABLE services 
ADD COLUMN gap_time_minutes INTEGER DEFAULT 0;

-- Create barber_services junction table to link barbers with services they offer
CREATE TABLE barber_services (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barber_id, service_id)
);

-- Create indexes for performance
CREATE INDEX idx_barber_services_barber_id ON barber_services(barber_id);
CREATE INDEX idx_barber_services_service_id ON barber_services(service_id);
