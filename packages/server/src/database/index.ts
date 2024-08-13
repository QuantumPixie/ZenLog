import {
  CamelCasePlugin,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
} from 'kysely';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { Database } from '../models/database';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

// const isTest = process.env.NODE_ENV === 'test';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Database URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database:', databaseUrl.replace(/\/\/.*@/, '//[REDACTED]@'));

export function createDatabase(options: pg.PoolConfig): Kysely<Database> {
  const pool = new pg.Pool(options);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  pool.on('connect', () => {
    console.log('Connected to the database');
  });

  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  });
}

const db = createDatabase({ connectionString: databaseUrl });

export { db };
export * from '../models/database';