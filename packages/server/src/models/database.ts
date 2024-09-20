import type { UserTable } from '../models/user.ts'
import type { MoodTable } from '../models/mood.ts'
import type { JournalEntryTable } from '../models/journalEntry.ts'
import type { ActivityTable } from '../models/activity.ts'

export interface Database {
  users: UserTable
  moods: MoodTable
  journal_entries: JournalEntryTable
  activities: ActivityTable
}
