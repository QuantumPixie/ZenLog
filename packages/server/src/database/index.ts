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
  const pool = new pg.Pool(options);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  // Test the connection
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('Error connecting to the database', err);
    }
  });

  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  });
}

const db = createDatabase({ connectionString: process.env.DATABASE_URL });

// db.selectFrom('users')
//   .select('id')
//   .limit(1)
//   .execute()
//   .catch((error) => {
//     console.error('Error querying users table:', error);
//     if (error.message.includes('relation "users" does not exist')) {
//       console.error('The users table does not exist. Make sure you have run your migrations.');
//     }
//   });

export type DatabasePartial<T> = Kysely<T>;
export { db };
export * from '../models/database';