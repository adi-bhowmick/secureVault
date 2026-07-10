import pool from '../database/pool.js';

const findAll = async () => {
  const result = await pool.query('SELECT * FROM achievements ORDER BY created_at');
  return result.rows;
};

const findBySlug = async (slug, client) => {
  const result = await (client || pool).query('SELECT * FROM achievements WHERE slug = $1', [slug]);
  return result.rows[0] || null;
};

const create = async ({ slug, name, description, icon, xpReward }) => {
  const result = await pool.query(
    `INSERT INTO achievements (slug, name, description, icon, xp_reward)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [slug, name, description, icon || null, xpReward || 100]
  );
  return result.rows[0];
};

const findUserAchievements = async (userId) => {
  const result = await pool.query(
    `SELECT a.*, ua.earned_at
     FROM achievements a
     JOIN user_achievements ua ON a.slug = ua.achievement_slug
     WHERE ua.user_id = $1
     ORDER BY ua.earned_at DESC`,
    [userId]
  );
  return result.rows;
};

const awardToUser = async (userId, achievementSlug, client) => {
  const result = await (client || pool).query(
    `INSERT INTO user_achievements (user_id, achievement_slug)
     VALUES ($1, $2)
     ON CONFLICT (user_id, achievement_slug) DO NOTHING
     RETURNING *`,
    [userId, achievementSlug]
  );
  return result.rows[0] || null;
};

const hasUserAchievement = async (userId, achievementSlug, client) => {
  const result = await (client || pool).query(
    'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_slug = $2',
    [userId, achievementSlug]
  );
  return result.rows.length > 0;
};

export default { findAll, findBySlug, create, findUserAchievements, awardToUser, hasUserAchievement };
