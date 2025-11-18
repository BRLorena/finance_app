import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/expenses/route'

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock the prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    expense: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockAuth = require('@/auth').auth
const mockPrisma = require('@/lib/db').prisma

describe('/api/expenses API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/expenses', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/expenses')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns paginated expenses for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      const mockExpenses = [
        {
          id: '1',
          amount: 50.00,
          description: 'Test expense',
          category: 'Food & Dining',
          date: new Date('2025-11-07'),
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.expense.findMany.mockResolvedValue(mockExpenses)
      mockPrisma.expense.count.mockResolvedValue(1)

      const request = new NextRequest('http://localhost:3000/api/expenses?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.expenses).toEqual(mockExpenses)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      })

      expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('filters expenses by category when provided', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      mockPrisma.expense.findMany.mockResolvedValue([])
      mockPrisma.expense.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/expenses?category=Food%20%26%20Dining')
      const response = await GET(request)

      expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-1',
          category: 'Food & Dining'
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('filters expenses by date range when provided', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      mockPrisma.expense.findMany.mockResolvedValue([])
      mockPrisma.expense.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/expenses?startDate=2025-11-01&endDate=2025-11-30')
      const response = await GET(request)

      expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-1',
          date: {
            gte: new Date('2025-11-01'),
            lte: new Date('2025-11-30'),
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      mockPrisma.expense.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/expenses')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST /api/expenses', () => {
    it('creates expense for authenticated user with valid data', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      const newExpense = {
        id: '2',
        amount: 75.50,
        description: 'New expense',
        category: 'Transportation',
        date: new Date('2025-11-07'),
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.expense.create.mockResolvedValue(newExpense)

      // Create request with valid body

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: '75.50',
          description: 'New expense',
          category: 'Transportation',
          date: '2025-11-07',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newExpense)

      expect(mockPrisma.expense.create).toHaveBeenCalledWith({
        data: {
          amount: 75.50,
          description: 'New expense',
          category: 'Transportation',
          date: new Date('2025-11-07'),
          userId: 'user-1',
        },
      })
    })

    it('returns 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: '50.00',
          description: 'Test expense',
          category: 'Food & Dining',
          date: '2025-11-07',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 for invalid request data', async () => {
      const mockSession = {
        user: { id: 'user-1', email: 'test@example.com' }
      }
      mockAuth.mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost:3000/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: '', // Invalid: empty amount
          description: 'Test expense',
          category: 'Food & Dining',
          date: '2025-11-07',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })
  })
})