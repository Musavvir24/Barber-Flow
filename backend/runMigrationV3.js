const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function runMigration() {
  try {
    const migration = fs.readFileSync('./db_migration_v3.sql', 'utf8');
    await pool.query(migration);
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
