import type { UserTable } from '../models/user'
import type { MoodTable } from '../models/mood.ts'
import type { JournalEntryTable } from '../models/journalEntry'
import type { ActivityTable } from '../models/activity'

export interface Database {
  users: UserTable
  moods: MoodTable
  journal_entries: JournalEntryTable
  activities: ActivityTable
}
