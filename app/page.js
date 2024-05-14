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

export default function Home() {
  return (
    <div>
      <h4>dcmall</h4>

      <form action="/api/post/login" method = "POST">
        <input type="text" placeholder="ID" name="id" />
        <input type="password" placeholder="PW" name="password" />
        <button type="submit">login</button>
      </form>

      <a href="/join"><button>회원가입</button></a>
    </div>
  );
}
