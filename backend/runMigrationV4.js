const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function runMigration() {
  try {
    // Try to add the column, ignore if it already exists
    await pool.query(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'razorpay';
    `);
    console.log('✓ Migration v4 completed successfully - gateway column added to payments table');
    process.exit(0);
  } catch (error) {
    // If it's already there, that's fine
    if (error.message.includes('column') && error.message.includes('already exists')) {
      console.log('✓ Gateway column already exists in payments table');
      process.exit(0);
    }
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
