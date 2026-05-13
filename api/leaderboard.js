import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sql = neon(process.env.POSTGRES_URL);
  const stat = req.query.stat || 'wave';
  const allowed = ['wave', 'kills', 'level', 'time'];
  if (!allowed.includes(stat)) return res.status(400).json({ error: 'Invalid stat' });

  const order = stat === 'time' ? 'ASC' : 'DESC';
  const rows = await sql`
    SELECT name, character, wave, kills, level, time
    FROM leaderboard
    ORDER BY ${sql.unsafe(stat + ' ' + order)}
    LIMIT 10
  `;

  res.status(200).json(rows);
}
