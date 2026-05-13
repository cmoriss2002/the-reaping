// Run once to create the leaderboard table:
// node -e "require('./api/setup.js')"
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL);
await sql`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(20)  NOT NULL,
    character  VARCHAR(10)  NOT NULL,
    wave       INTEGER      NOT NULL DEFAULT 0,
    kills      INTEGER      NOT NULL DEFAULT 0,
    level      INTEGER      NOT NULL DEFAULT 0,
    time       INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  )
`;
console.log('Table created.');
