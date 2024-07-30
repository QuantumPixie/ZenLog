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

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

export function createDatabase(options: pg.PoolConfig): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool(options),
    }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  });
}

const db = createDatabase({ connectionString: process.env.DATABASE_URL });

export type DatabasePartial<T> = Kysely<T>;
export { db };
export * from '../models/database';
