const { query } = require('./src/utils/db');

async function testData() {
  try {
    const result = await query('SELECT id, start_time, end_time, customer_name, status FROM appointments ORDER BY created_at DESC LIMIT 10');
    console.log('\nLast 10 appointments:');
    result.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Customer: ${row.customer_name}, Status: ${row.status}`);
      console.log(`    Start: ${row.start_time}`);
      console.log(`    End: ${row.end_time}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testData();
