import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface MoodTable {
  id: Generated<number>
  user_id: number
  date: string
  moodScore: number
  emotions: string[]
}
