import { Pool } from 'pg'

let pool: Pool

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  }
  return pool
}

export async function initSchema() {
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS colaboradores (
      matricula TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      departamento TEXT
    );
    CREATE TABLE IF NOT EXISTS confirmacoes (
      id SERIAL PRIMARY KEY,
      matricula TEXT NOT NULL,
      data TEXT NOT NULL,
      confirmado_em TEXT NOT NULL,
      UNIQUE(matricula, data),
      FOREIGN KEY(matricula) REFERENCES colaboradores(matricula)
    );
  `)
}
