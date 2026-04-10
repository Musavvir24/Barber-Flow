// Migration V7 Runner - Create password_reset_tokens table
const fs = require('fs');
const path = require('path');
const { query } = require('./src/utils/db');

async function runMigration() {
  try {
    console.log('Starting Migration V7: Creating password_reset_tokens table...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'db_migration_v7.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL
    await query(sqlContent);

    console.log('✅ Migration V7 completed successfully - password_reset_tokens table created');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration V7 failed:', error.message);
    process.exit(1);
  }
}

runMigration();
