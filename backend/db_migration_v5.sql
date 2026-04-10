-- Create barber_breaks table for managing daily break times per barber
CREATE TABLE IF NOT EXISTS barber_breaks (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL,
  break_start_time TIME NOT NULL,
  break_end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_barber_breaks_barber_id ON barber_breaks(barber_id, day_of_week);
