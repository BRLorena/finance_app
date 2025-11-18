import { NextRequest } from 'next/server'
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

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User created successfully')
      expect(data.user).toEqual({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      })

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
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

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('returns 400 for invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'A', // Too short
          email: 'invalid-email', // Invalid email
          password: '123', // Too short
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('returns 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name, email, password
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('handles invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: 'invalid-json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(mockPrisma.user.create).not.toHaveBeenCalled()
    })
  })
})