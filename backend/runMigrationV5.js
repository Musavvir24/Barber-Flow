const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function runMigration() {
  try {
    // Create barber_breaks table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS barber_breaks (
        id SERIAL PRIMARY KEY,
        barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        break_start_time TIME NOT NULL,
        break_end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index if it doesn't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_barber_breaks_barber_id ON barber_breaks(barber_id, day_of_week);
    `);

    console.log('✓ Migration v5 completed successfully - barber_breaks table created');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
