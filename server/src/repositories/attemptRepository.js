import pool from '../database/pool.js';

const create = async ({ userId, labSlug, submittedFlag, isCorrect, pointsAwarded, timeTaken }, client) => {
  const result = await (client || pool).query(
    `INSERT INTO lab_attempts (user_id, lab_slug, submitted_flag, is_correct, points_awarded, time_taken_seconds)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, labSlug, submittedFlag, isCorrect, pointsAwarded || 0, timeTaken || null]
  );
  return result.rows[0];
};

const findByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM lab_attempts WHERE user_id = $1 ORDER BY submitted_at DESC',
    [userId]
  );
  return result.rows;
};

const findByUserAndLab = async (userId, labSlug) => {
  const result = await pool.query(
    'SELECT * FROM lab_attempts WHERE user_id = $1 AND lab_slug = $2 ORDER BY submitted_at DESC',
    [userId, labSlug]
  );
  return result.rows;
};

const countCorrectByUser = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM lab_attempts WHERE user_id = $1 AND is_correct = TRUE',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

export default { create, findByUser, findByUserAndLab, countCorrectByUser };
