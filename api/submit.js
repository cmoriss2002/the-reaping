import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, character, wave, kills, level, time } = req.body;

  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Name required' });

  const cleanName = name.trim().slice(0, 20);
  const validChars = ['knight', 'mage', 'rogue'];
  if (!validChars.includes(character)) return res.status(400).json({ error: 'Invalid character' });

  const sql = neon(process.env.POSTGRES_URL);
  await sql`
    INSERT INTO leaderboard (name, character, wave, kills, level, time)
    VALUES (${cleanName}, ${character}, ${Math.floor(wave)}, ${Math.floor(kills)}, ${Math.floor(level)}, ${Math.floor(time)})
  `;

  res.status(200).json({ ok: true });
}
