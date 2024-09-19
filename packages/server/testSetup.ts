import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret'
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://thuppertz:turing_college@localhost:5432/mental_health_tracker_test'

console.log(
  'Test Database URL:',
  process.env.DATABASE_URL.replace(/\/\/.*@/, '//[REDACTED]@')
)
// Mock process.exit
const originalProcessExit = process.exit
process.exit = ((code?: number) => {
  console.error(`process.exit(${code}) called`)
  return undefined as never
}) as (code?: number) => never

export const cleanup = () => {
  process.exit = originalProcessExit
}
