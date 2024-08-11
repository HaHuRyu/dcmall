import pool from './database';

export default async function handler(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Error executing query' });
  }
}
