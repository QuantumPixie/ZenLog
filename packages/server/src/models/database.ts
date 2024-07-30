import type { UserTable } from './user';
import type { MoodTable } from './mood';
import type { JournalEntryTable } from './journalEntry';
import type { ActivityTable } from './activity';


export interface Database {
  users: UserTable;
  moods: MoodTable;
  journal_entries: JournalEntryTable;
  activities: ActivityTable;
}