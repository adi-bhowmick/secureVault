import labEngine from '../engine/labEngine.js';
import pool from '../database/pool.js';
import progressRepository from '../repositories/progressRepository.js';
import attemptRepository from '../repositories/attemptRepository.js';
import achievementService from '../services/achievementService.js';
import userRepository from '../repositories/userRepository.js';

const init = () => {
  labEngine.loadAllLabs();
};

const listLabs = () => {
  return labEngine.getLabSummaries();
};

const getLab = (slug) => {
  const lab = labEngine.getLab(slug);
  if (!lab) return null;
  return {
    slug: lab.slug,
    name: lab.config.name,
    description: lab.config.description,
    difficulty: lab.config.difficulty,
    category: lab.config.category,
    points: lab.config.points,
    tokens: lab.config.tokens || null,
    hints: lab.config.hints || [],
    explanation: lab.explanation,
  };
};

const submitFlag = async (userId, slug, submittedFlag, timeTaken) => {
  const result = labEngine.verifyFlag(slug, submittedFlag);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await attemptRepository.create({
      userId,
      labSlug: slug,
      submittedFlag,
      isCorrect: result.valid,
      pointsAwarded: result.points,
      timeTaken,
    }, client);

    if (result.valid) {
      const existing = await progressRepository.findByUserAndLab(userId, slug, client);
      const alreadyCompleted = existing && existing.completed;

      await progressRepository.createOrUpdate(userId, slug, client);
      await progressRepository.markCompleted(userId, slug, result.points, client);

      if (!alreadyCompleted) {
        await userRepository.updatePoints(userId, result.points, client);
      }

      const progress = await progressRepository.findByUser(userId, client);
      const completedCount = progress.filter((p) => p.completed).length;

      if (completedCount === 1) {
        await achievementService.awardAchievement(userId, 'first-lab', client);
      }
      if (completedCount === 5) {
        await achievementService.awardAchievement(userId, 'five-labs', client);
      }

      const labAchievement = {
        'weak-secret': 'weak-secret-master',
        'expired-token': 'expired-token-master',
        'payload-tampering': 'tamper-master',
        'role-escalation': 'escalation-master',
        'signature-verification': 'signature-master',
      };
      if (labAchievement[slug]) {
        await achievementService.awardAchievement(userId, labAchievement[slug], client);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return { ...result, lab: slug };
};

export default { init, listLabs, getLab, submitFlag };
