import pool from '../database/pool.js';

const create = async ({ userId, action, resource, metadata, ipAddress, userAgent }) => {
  const result = await pool.query(
    `INSERT INTO audit_logs (user_id, action, resource, metadata, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId || null, action, resource || null, metadata || null, ipAddress || null, userAgent || null]
  );
  return result.rows[0];
};

const findByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const findRecent = async (limit = 50) => {
  const result = await pool.query(
    'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
};

export default { create, findByUser, findRecent };
