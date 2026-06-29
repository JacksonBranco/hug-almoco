import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'hug.db')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs')
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS colaboradores (
      matricula TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      departamento TEXT
    );

    CREATE TABLE IF NOT EXISTS confirmacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricula TEXT NOT NULL,
      data TEXT NOT NULL,
      confirmado_em TEXT NOT NULL,
      UNIQUE(matricula, data),
      FOREIGN KEY(matricula) REFERENCES colaboradores(matricula)
    );
  `)
}
