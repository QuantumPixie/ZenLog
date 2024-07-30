import { vi } from 'vitest';
import { createMockDatabase } from './mocks/databaseMock';

const mockDb = createMockDatabase();

vi.mock('../database', () => ({
  db: mockDb,
  createDatabase: vi.fn(() => mockDb),
}));
