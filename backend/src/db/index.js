// Conexion unica a SQLite usando el modulo nativo de Node (node:sqlite, Node 22.5+).
// No requiere compilacion nativa ni dependencias externas.
// El archivo de base de datos vive junto al backend (agro-trace.db).
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const DB_PATH = join(__dirname, '..', '..', 'agro-trace.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Aplica el esquema (idempotente: usa CREATE TABLE IF NOT EXISTS).
export function aplicarEsquema() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}

export default db;
