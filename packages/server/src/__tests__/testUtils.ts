import { vi } from 'vitest';
import { mockKysely } from './mocks/databaseMock';

export function resetMocks() {
  vi.resetAllMocks();
  Object.values(mockKysely).forEach(mock => {
    if (typeof mock === 'function' && vi.isMockFunction(mock)) {
      mock.mockClear();
    } else if (typeof mock === 'object' && mock !== null) {
      Object.values(mock).forEach(subMock => {
        if (vi.isMockFunction(subMock)) {
          subMock.mockClear();
        }
      });
    }
  });
}