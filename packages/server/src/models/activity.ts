import type { ColumnType } from 'kysely'

export interface ActivityTable {
  id: number
  user_id: number
  date: string // YYYY-MM-DD format
  activity: string
  duration?: number
  notes?: string
}

export type NewActivity = Omit<ActivityTable, 'id'> & { id?: number }
export type ActivityInput = Omit<NewActivity, 'user_id' | 'id'>

export interface DatabaseActivityTable {
  id: ColumnType<number, number | undefined, never>
  user_id: number
  date: ColumnType<string, string, string> // YYYY-MM-DD string in database
  activity: string
  duration: ColumnType<
    number | undefined,
    number | undefined,
    number | undefined
  >
  notes: ColumnType<string | undefined, string | undefined, string | undefined>
}
