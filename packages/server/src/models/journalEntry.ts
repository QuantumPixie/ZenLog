import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>


export interface JournalEntryTable {
  id:Generated<number>;
  user_id: number;
  date: Date;
  entry: string;
  sentiment: number; 
}

export type NewJournalEntry = Omit<JournalEntryTable, 'id'>;
