import pool from '../database/pool.js';
import progressRepository from '../repositories/progressRepository.js';
import attemptRepository from '../repositories/attemptRepository.js';
import achievementRepository from '../repositories/achievementRepository.js';
import logRepository from '../repositories/logRepository.js';
import userRepository from '../repositories/userRepository.js';

const testAll = async () => {
  console.log('=== Testing CRUD Operations ===\n');

  // 1. Create test user
  const bcrypt = await import('bcrypt');
  const hash = await bcrypt.hash('test1234', 10);
  const user = await userRepository.create({
    username: 'crudtest',
    email: 'crud@test.com',
    passwordHash: hash,
  });
  console.log('1. User created:', user.id);

  // 2. Find user
  const found = await userRepository.findById(user.id);
  console.log('2. User found:', found.username);

  // 3. Progress - create
  const progress = await progressRepository.createOrUpdate(user.id, 'weak-secret');
  console.log('3. Progress created:', progress.lab_slug);

  // 4. Progress - increment
  const updated = await progressRepository.createOrUpdate(user.id, 'weak-secret');
  console.log('4. Progress attempts:', updated.attempts);

  // 5. Progress - mark completed
  const completed = await progressRepository.markCompleted(user.id, 'weak-secret', 100);
  console.log('5. Progress completed:', completed.completed, 'score:', completed.score);

  // 6. Progress - find by user
  const allProgress = await progressRepository.findByUser(user.id);
  console.log('6. All progress count:', allProgress.length);

  // 7. Attempt - create
  const attempt = await attemptRepository.create({
    userId: user.id,
    labSlug: 'weak-secret',
    submittedFlag: 'wrong-flag',
    isCorrect: false,
    pointsAwarded: 0,
    timeTaken: 60,
  });
  console.log('7. Attempt created:', attempt.id);

  // 8. Attempt - find by user
  const attempts = await attemptRepository.findByUser(user.id);
  console.log('8. Attempts count:', attempts.length);

  // 9. Achievement - find all
  const achievements = await achievementRepository.findAll();
  console.log('9. Achievements count:', achievements.length);

  // 10. Achievement - find by slug
  const slug = await achievementRepository.findBySlug('first-lab');
  console.log('10. Achievement found:', slug.name);

  // 11. Achievement - award
  await achievementRepository.awardToUser(user.id, 'first-lab');
  const hasIt = await achievementRepository.hasUserAchievement(user.id, 'first-lab');
  console.log('11. Achievement awarded:', hasIt);

  // 12. Achievement - find user achievements
  const userAch = await achievementRepository.findUserAchievements(user.id);
  console.log('12. User achievements:', userAch.length);

  // 13. Log - create
  const log = await logRepository.create({
    userId: user.id,
    action: 'test_action',
    resource: 'test_resource',
    metadata: { key: 'value' },
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  });
  console.log('13. Log created:', log.id);

  // 14. Log - find by user
  const logs = await logRepository.findByUser(user.id);
  console.log('14. Logs count:', logs.length);

  // 15. Log - find recent
  const recent = await logRepository.findRecent(5);
  console.log('15. Recent logs:', recent.length);

  // Cleanup
  await pool.query('DELETE FROM audit_logs WHERE user_id = $1', [user.id]);
  await pool.query('DELETE FROM user_achievements WHERE user_id = $1', [user.id]);
  await pool.query('DELETE FROM lab_attempts WHERE user_id = $1', [user.id]);
  await pool.query('DELETE FROM user_progress WHERE user_id = $1', [user.id]);
  await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
  console.log('\nCleanup done.');

  console.log('\n=== All CRUD Tests Passed ===');
  await pool.end();
};

testAll().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
