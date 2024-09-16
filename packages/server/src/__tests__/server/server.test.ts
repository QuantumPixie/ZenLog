import { createServer, Server } from 'http'
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
  beforeEach,
  afterEach,
} from 'vitest'
import request from 'supertest'
import { AddressInfo } from 'net'
import type { MockDatabase } from '../mocks/databaseMock'
import { createMockDatabase } from '../mocks/databaseMock'
import app from '../../server'

describe('Server', () => {
  let mockDb: MockDatabase
  let server: Server
  let baseUrl: string

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        server = createServer(app)
        server.listen(0, () => {
          const address = server.address() as AddressInfo
          baseUrl = `http://localhost:${address.port}`
          mockDb = createMockDatabase()
          resolve()
        })
      })
  )

  beforeEach(() => {
    mockDb = createMockDatabase()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve())
      })
  )

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
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:4173']

  it.each(allowedOrigins)('should allow CORS for %s', async (origin) => {
    const response = await request(app).get('/api/health').set('Origin', origin)

    expect(response.headers['access-control-allow-origin']).toBe(origin)
  })

  it('should not allow CORS for disallowed origins', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://example.com')

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })

  it.each(allowedOrigins)(
    'should handle preflight requests and include appropriate CORS headers for %s',
    async (origin) => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')

      expect(response.headers['access-control-allow-origin']).toBe(origin)
      expect(response.headers['access-control-allow-methods']).toBeDefined()
      expect(response.headers['access-control-allow-headers']).toBeDefined()
    }
  )

  it('should not include CORS headers for disallowed origins in preflight requests', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Content-Type')

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})
