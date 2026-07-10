import pool from '../database/pool.js';

const achievements = [
  { slug: 'first-login', name: 'First Steps', description: 'Log in for the first time', icon: '🚀', xpReward: 50 },
  { slug: 'first-lab', name: 'Lab Rat', description: 'Complete your first lab', icon: '🔬', xpReward: 100 },
  { slug: 'weak-secret-master', name: 'Weak Spot', description: 'Complete the Weak Secret lab', icon: '🔓', xpReward: 150 },
  { slug: 'expired-token-master', name: 'Time Traveler', description: 'Complete the Expired Token lab', icon: '⏰', xpReward: 150 },
  { slug: 'tamper-master', name: 'Tamper Pro', description: 'Complete the Payload Tampering lab', icon: '🔧', xpReward: 200 },
  { slug: 'escalation-master', name: 'Level Up', description: 'Complete the Role Escalation lab', icon: '📈', xpReward: 200 },
  { slug: 'signature-master', name: 'Sig Check', description: 'Complete the Signature Verification lab', icon: '✅', xpReward: 200 },
  { slug: 'five-labs', name: 'Getting Serious', description: 'Complete 5 labs', icon: '🎯', xpReward: 300 },
  { slug: 'all-labs', name: 'JWTLab Graduate', description: 'Complete all labs', icon: '🎓', xpReward: 500 },
  { slug: 'streak-3', name: 'On Fire', description: 'Complete 3 labs in a row', icon: '🔥', xpReward: 250 },
];

const seed = async () => {
  console.log('Seeding achievements...');

  for (const a of achievements) {
    try {
      await pool.query(
        `INSERT INTO achievements (slug, name, description, icon, xp_reward)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [a.slug, a.name, a.description, a.icon, a.xpReward]
      );
      console.log(`  + ${a.name}`);
    } catch (err) {
      console.error(`  ! Failed: ${a.name} - ${err.message}`);
    }
  }

  const result = await pool.query('SELECT COUNT(*) as count FROM achievements');
  console.log(`Done. Total achievements: ${result.rows[0].count}`);
  await pool.end();
};

seed();
