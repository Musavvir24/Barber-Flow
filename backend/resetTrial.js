const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Musavvir20@localhost:5432/barberflow'
});

async function resetTrial() {
  try {
    const trialEndsAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const result = await pool.query(
      'UPDATE shops SET trial_ends_at = $1 WHERE is_premium = false',
      [trialEndsAt]
    );
    console.log('✓ Updated', result.rowCount, 'shops with 5-minute trial');
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

resetTrial();
