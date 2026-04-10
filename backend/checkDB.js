const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function check() {
  try {
    const result = await pool.query(`SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'barber_services')`);
    console.log('barber_services table exists:', result.rows[0].exists);
    
    if (!result.rows[0].exists) {
      console.log('Creating barber_services table...');
      await pool.query(`
        CREATE TABLE barber_services (
          id SERIAL PRIMARY KEY,
          barber_id INTEGER NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
          service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(barber_id, service_id)
        )
      `);
      await pool.query(`CREATE INDEX idx_barber_services_barber_id ON barber_services(barber_id)`);
      await pool.query(`CREATE INDEX idx_barber_services_service_id ON barber_services(service_id)`);
      console.log('✓ barber_services table created');
    } else {
      console.log('✓ barber_services table already exists');
    }
    
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
