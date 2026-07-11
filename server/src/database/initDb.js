import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, '../../../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('Database schema applied');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('Database schema already exists');
    } else {
      console.error('Schema error:', err.message);
    }
  }
};

export default initDb;
