import type { ColumnType } from 'kysely';

export interface ActivityTable {
  id: number;
  user_id: number;
  date: Date;
  activity: string;
  duration: number | null;
  notes: string | null;
}

export type NewActivity = Omit<ActivityTable, 'id'> & { id?: number };
export type ActivityInput = Omit<NewActivity, 'user_id' | 'id'>;

export interface DatabaseActivityTable {
  id: ColumnType<number, number | undefined, never>;
  user_id: number;
  date: ColumnType<Date, string | Date, string | Date>;
  activity: string;
  duration: number | null;
  notes: string | null;
}

// This type represents the raw result from the database
export type RawDatabaseActivity = {
  id: number;
  user_id: number;
  date: Date | string;
  activity: string;
  duration: number | null;
  notes: string | null;
};

// Updated type guard for RawDatabaseActivity
export function isRawDatabaseActivity(obj: unknown): obj is RawDatabaseActivity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'date' in obj &&
    'activity' in obj &&
    'duration' in obj &&
    'notes' in obj &&
    typeof obj.id === 'number' &&
    typeof obj.user_id === 'number' &&
    (obj.date instanceof Date || typeof obj.date === 'string') &&
    typeof obj.activity === 'string' &&
    (obj.duration === null || typeof obj.duration === 'number') &&
    (obj.notes === null || typeof obj.notes === 'string')
  );
}