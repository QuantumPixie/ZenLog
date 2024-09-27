import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from '../../../models/database'

export async function createTestDatabase(): Promise<Kysely<Database>> {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL is not set in the environment variables')
  }

  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: testDatabaseUrl,
    }),
  })

  return new Kysely<Database>({
    dialect,
  })
}
