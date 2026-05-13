import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = neon(process.env.POSTGRES_URL);

  if (req.method === 'GET') {
    const { code } = req.query;
    if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Code required' });
    const rows = await sql`SELECT save_data FROM saves WHERE code = ${code.toUpperCase()}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Code not found' });
    return res.status(200).json(rows[0].save_data);
  }

  if (req.method === 'POST') {
    const { code, save_data } = req.body;
    if (!code || !save_data) return res.status(400).json({ error: 'Code and save_data required' });
    await sql`
      INSERT INTO saves (code, save_data, updated_at)
      VALUES (${code.toUpperCase()}, ${JSON.stringify(save_data)}, NOW())
      ON CONFLICT (code) DO UPDATE SET save_data = EXCLUDED.save_data, updated_at = NOW()
    `;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
