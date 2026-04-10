const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function runMigration() {
  try {
    const migration = fs.readFileSync('./db_migration_v2.sql', 'utf8');
    console.log('Running migration v2...');
    await pool.query(migration);
    console.log('✓ Migration v2 completed successfully');
    
    // Verify columns
    const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'services' ORDER BY ordinal_position");
    console.log('Services table columns:', result.rows.map(r => r.column_name).join(', '));
    
    // Check barber_services table
    const bsCheck = await pool.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'barber_services')");
    console.log('barber_services table exists:', bsCheck.rows[0].exists);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
