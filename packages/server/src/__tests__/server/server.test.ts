import { createServer, Server } from 'http'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

import type { MockDatabase } from '../mocks/databaseMock'

import { createMockDatabase } from '../mocks/databaseMock'
import app from '../../server'

describe('Server', () => {
  let mockDb: MockDatabase
  let server: Server
  let baseUrl: string

  beforeAll(() => new Promise<void>((resolve) => {
      server = createServer(app)
      server.listen(0, () => {
        const address = server.address()
        if (address && typeof address !== 'string') {
          baseUrl = `http://localhost:${address.port}`
          mockDb = createMockDatabase()
        } else {
          throw new Error('Server address is not valid')
        }
        resolve()
      })
    }))

  beforeEach(() => {
    mockDb = createMockDatabase()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(() => new Promise<void>((resolve) => {
      server.close(() => resolve())
    }))

  it('should respond with 200 OK for health check', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('OK')
  })

  it('should handle 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/unknown`)
    expect(response.status).toBe(404)
  })

  it('should interact with the mock database', async () => {
    const mockData = { id: 1, name: 'test' }
    mockDb.insert(mockData)

    const item = mockDb.find(1)
    expect(item).toEqual(mockData)
  })
})

describe('CORS', () => {
  it('should allow CORS for any origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://example.com')

    expect(response.headers['access-control-allow-origin']).toBe('*')
  })

  it('should handle preflight requests and include appropriate CORS headers', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Content-Type')

    expect(response.headers['access-control-allow-origin']).toBe('*')
    expect(response.headers['access-control-allow-methods']).toBeDefined()
    expect(response.headers['access-control-allow-headers']).toBeDefined()
  })
})
