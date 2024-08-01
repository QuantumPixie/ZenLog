import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer, Server } from 'http';

import type { MockDatabase } from '../mocks/databaseMock';

import { createMockDatabase } from '../mocks/databaseMock';
import app from '../../server';

describe('Server', () => {
  let mockDb: MockDatabase;
  let server: Server;
  let baseUrl: string;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      server = createServer(app);
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          baseUrl = `http://localhost:${address.port}`;
          mockDb = createMockDatabase();
        } else {
          throw new Error('Server address is not valid');
        }
        resolve();
      });
    });
  });

  beforeEach(() => {
    mockDb = createMockDatabase();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });


  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('should respond with 200 OK for health check', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('OK');
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    expect(response.status).toBe(404);
  });

  it('should interact with the mock database', async () => {
    const mockData = { id: 1, name: 'test' };
    mockDb.insert(mockData);

    const item = mockDb.find(1);
    expect(item).toEqual(mockData);
  });

});