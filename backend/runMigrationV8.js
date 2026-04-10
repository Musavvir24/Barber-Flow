const { query } = require('./src/utils/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    const migrationPath = path.join(__dirname, 'db_migration_v8.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running Migration V8: Add premium_expires_at column...');
    
    // Execute each statement separately
    const statements = migration.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✓ Migration V8 completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration V8 failed:', error.message);
    process.exit(1);
  }
};

runMigration();
