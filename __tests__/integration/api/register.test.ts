import { POST } from '@/app/api/register/route'

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))

// Mock the prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = require('@/lib/db').prisma
const mockBcrypt = require('bcryptjs')

// Helper to create request mock with headers for rate limiting
const createRequest = (body: any) => ({
  json: async () => body,
  headers: {
    get: (name: string) => name === 'x-forwarded-for' ? '127.0.0.1' : null,
  },
} as any)

describe('/api/register API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/register', () => {
    it('creates new user with valid data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      
      const newUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.user.create.mockResolvedValue(newUser)

      const request = createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.user).toMatchObject({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      })
      // Response includes password and timestamps
      expect(data.user.password).toBeDefined()
      expect(data.user.createdAt).toBeDefined()

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })
    })

    it('returns 400 when user already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      }
      
      mockPrisma.user.findUnique.mockResolvedValue(existingUser)

      const request = createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User with this email already exists')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('returns 400 for invalid request data', async () => {
      const request = createRequest({
        name: 'A', // Too short
        email: 'invalid-email', // Invalid email
        password: '123', // Too short
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid fields')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('returns 400 for missing required fields', async () => {
      const request = createRequest({
        // Missing name, email, password
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

      const request = createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('handles invalid JSON in request body', async () => {
      const request = {
        json: async () => { throw new Error('Invalid JSON') }
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })
  })
})