import pool from '../database/pool.js';

const findByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const findByUsername = async (username) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, username, email, xp, level, total_points, labs_completed, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const create = async ({ username, email, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, xp, level, total_points, labs_completed, created_at`,
    [username, email, passwordHash]
  );
  return result.rows[0];
};

const updatePoints = async (userId, points, client) => {
  const result = await (client || pool).query(
    `UPDATE users
     SET xp = xp + $2,
         total_points = total_points + $2,
         labs_completed = labs_completed + 1,
         level = GREATEST(1, (xp + $2) / 200 + 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, username, xp, level, total_points, labs_completed`,
    [userId, points]
  );
  return result.rows[0];
};

const addXP = async (userId, xp, client) => {
  const result = await (client || pool).query(
    `UPDATE users
     SET xp = xp + $2,
         level = GREATEST(1, (xp + $2) / 200 + 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, username, xp, level, total_points, labs_completed`,
    [userId, xp]
  );
  return result.rows[0];
};

const getLeaderboard = async (limit = 20) => {
  const result = await pool.query(
    `SELECT id, username, xp, level, total_points, labs_completed
     FROM users
     ORDER BY total_points DESC, xp DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};

export default { findByEmail, findByUsername, findById, create, updatePoints, addXP, getLeaderboard };
