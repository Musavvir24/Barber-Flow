const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function checkTrial() {
  try {
    const result = await pool.query('SELECT id, name, trial_ends_at, is_premium FROM shops WHERE is_premium = false');
    console.log('\nShop Trial Status:');
    result.rows.forEach(shop => {
      const now = new Date();
      const trialEnds = new Date(shop.trial_ends_at);
      const minutesLeft = Math.ceil((trialEnds - now) / (1000 * 60));
      console.log(`  ID ${shop.id}: ${shop.name} | Premium: ${shop.is_premium} | ${minutesLeft} minutes left`);
      console.log(`    Ends at: ${trialEnds.toLocaleString()}`);
    });
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkTrial();
