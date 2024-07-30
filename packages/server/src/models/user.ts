import type { ColumnType } from 'kysely';

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface UserTable {
  id: Generated<number>;
  email: string;
  username: string;
  password: string;
}

export type NewUser = Omit<UserTable, 'id'>;