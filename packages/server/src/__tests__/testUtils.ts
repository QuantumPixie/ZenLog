import { vi } from 'vitest';
import type { MockDatabase } from './mocks/databaseMock';
import { db } from '../database';

export const getMockDb = (): MockDatabase => db as unknown as MockDatabase;

export const clearMocks = (): void => {
  const mockDb = getMockDb();
  vi.clearAllMocks();
  Object.values(mockDb).forEach(mock => {
    if (typeof mock === 'function' && mock.mockClear) {
      mock.mockClear();
    }
  });
};