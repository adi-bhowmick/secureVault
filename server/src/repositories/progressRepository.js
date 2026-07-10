import pool from '../database/pool.js';

const findByUserAndLab = async (userId, labSlug, client) => {
  const result = await (client || pool).query(
    'SELECT * FROM user_progress WHERE user_id = $1 AND lab_slug = $2',
    [userId, labSlug]
  );
  return result.rows[0] || null;
};

const findByUser = async (userId, client) => {
  const result = await (client || pool).query(
    'SELECT * FROM user_progress WHERE user_id = $1 ORDER BY last_played DESC',
    [userId]
  );
  return result.rows;
};

const createOrUpdate = async (userId, labSlug, client) => {
  const existing = await findByUserAndLab(userId, labSlug, client);
  if (existing) {
    const result = await (client || pool).query(
      `UPDATE user_progress
       SET attempts = attempts + 1, last_played = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND lab_slug = $2
       RETURNING *`,
      [userId, labSlug]
    );
    return result.rows[0];
  }

  const result = await (client || pool).query(
    `INSERT INTO user_progress (user_id, lab_slug, started_at, attempts)
     VALUES ($1, $2, CURRENT_TIMESTAMP, 1)
     RETURNING *`,
    [userId, labSlug]
  );
  return result.rows[0];
};

const markCompleted = async (userId, labSlug, score, client) => {
  const result = await (client || pool).query(
    `UPDATE user_progress
     SET completed = TRUE, score = $3, completed_at = CURRENT_TIMESTAMP, last_played = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND lab_slug = $2
     RETURNING *`,
    [userId, labSlug, score]
  );
  return result.rows[0];
};

const deleteByUser = async (userId) => {
  await pool.query('DELETE FROM user_progress WHERE user_id = $1', [userId]);
};

export default { findByUserAndLab, findByUser, createOrUpdate, markCompleted, deleteByUser };
