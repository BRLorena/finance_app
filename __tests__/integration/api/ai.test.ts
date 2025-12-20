/**
 * Integration tests for AI API routes
 */

// Setup mocks before any imports
const mockChatCompletions = {
  create: jest.fn(),
}

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: mockChatCompletions,
    },
  }))
})

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    expense: {
      findMany: jest.fn(),
    },
    income: {
      findMany: jest.fn(),
    },
  },
}))

import { POST as categorizeHandler } from '@/app/api/ai/categorize/route'
import { POST as insightsHandler } from '@/app/api/ai/insights/route'
import { POST as parseExpenseHandler } from '@/app/api/ai/parse-expense/route'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

describe('AI API Routes - Integration Tests', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockRequest = (body: any) => ({
    json: async () => body,
  }) as any

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GROQ_API_KEY = 'test-api-key'
    
    // Default auth mock - authenticated user
    ;(mockAuth as any).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User', email: 'test@example.com' },
    })
  })

  afterEach(() => {
    delete process.env.GROQ_API_KEY
  })

  describe('POST /api/ai/categorize', () => {
    it('should categorize expense successfully', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '1' } }],
      })

      const request = mockRequest({
        description: 'Lunch at Chipotle',
        locale: 'en',
      })

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.category).toBe('foodDining')
    })

    it('should return 401 for unauthenticated requests', async () => {
      ;(mockAuth as any).mockResolvedValue(null)

      const request = mockRequest({
        description: 'Test expense',
      })

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for missing description', async () => {
      const request = mockRequest({})

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Description is required')
    })

    it('should return 400 for invalid description type', async () => {
      const request = mockRequest({
        description: 123,
      })

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Description is required')
    })

    it('should handle API errors gracefully', async () => {
      mockChatCompletions.create.mockRejectedValue(new Error('API Error'))

      const request = mockRequest({
        description: 'Test expense',
      })

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to categorize expense')
    })

    it('should support different locales', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '1' } }],
      })

      const request = mockRequest({
        description: 'Almoço',
        locale: 'pt',
      })

      const response = await categorizeHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.category).toBeTruthy()
    })
  })

  describe('POST /api/ai/insights', () => {
    beforeEach(() => {
      // Mock database queries
      const mockExpenses = [
        {
          id: '1',
          amount: 50,
          category: 'foodDining',
          date: new Date('2024-12-15'),
          userId: 'user-123',
        },
        {
          id: '2',
          amount: 30,
          category: 'transportation',
          date: new Date('2024-12-10'),
          userId: 'user-123',
        },
      ]

      const mockIncomes = [
        {
          id: '1',
          amount: 3000,
          date: new Date('2024-12-01'),
          userId: 'user-123',
        },
      ]

      ;(prisma.expense.findMany as jest.Mock).mockResolvedValue(mockExpenses)
      ;(prisma.income.findMany as jest.Mock).mockResolvedValue(mockIncomes)
    })

    it('should generate financial insights successfully', async () => {
      const mockInsights = {
        summary: 'Your financial health is good',
        trends: ['Spending is stable'],
        recommendations: ['Save more'],
        alerts: [],
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockInsights) } }],
      })

      const request = mockRequest({ locale: 'en' })

      const response = await insightsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBeTruthy()
      expect(data.trends).toBeInstanceOf(Array)
      expect(data.recommendations).toBeInstanceOf(Array)
      expect(data.alerts).toBeInstanceOf(Array)
    })

    it('should return 401 for unauthenticated requests', async () => {
      ;(mockAuth as any).mockResolvedValue(null)

      const request = mockRequest({})

      const response = await insightsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should handle database errors', async () => {
      ;(prisma.expense.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = mockRequest({})

      const response = await insightsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate insights')
    })

    it('should return fallback insights on AI error', async () => {
      mockChatCompletions.create.mockRejectedValue(new Error('API Error'))

      const request = mockRequest({})

      const response = await insightsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBeTruthy()
      expect(data.trends).toBeInstanceOf(Array)
      expect(data.recommendations).toBeInstanceOf(Array)
    })

    it('should support different locales', async () => {
      const mockInsights = {
        summary: 'Sua saúde financeira está boa',
        trends: ['Gastos estáveis'],
        recommendations: ['Economize mais'],
        alerts: [],
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockInsights) } }],
      })

      const request = mockRequest({ locale: 'pt' })

      const response = await insightsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.summary).toBeTruthy()
    })
  })

  describe('POST /api/ai/parse-expense', () => {
    it('should parse expense text successfully', async () => {
      const mockParsed = {
        amount: 45.99,
        description: 'Groceries',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockParsed) } }],
      })

      const request = mockRequest({
        text: 'Spent $45.99 on groceries',
        locale: 'en',
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.amount).toBe(45.99)
      expect(data.description).toBe('Groceries')
      expect(data.category).toBe('foodDining')
      expect(data.date).toBe('2024-12-20')
    })

    it('should return 401 for unauthenticated requests', async () => {
      ;(mockAuth as any).mockResolvedValue(null)

      const request = mockRequest({
        text: 'Test expense',
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for missing text', async () => {
      const request = mockRequest({})

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Text is required')
    })

    it('should return 400 for invalid text type', async () => {
      const request = mockRequest({
        text: 123,
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Text is required')
    })

    it('should handle parsing errors with fallback', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: 'invalid json' } }],
      })

      const request = mockRequest({
        text: '$25 coffee',
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.amount).toBe(25)
      expect(data.description).toBe('$25 coffee')
    })

    it('should parse text without amount', async () => {
      const mockParsed = {
        amount: null,
        description: 'Coffee',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockParsed) } }],
      })

      const request = mockRequest({
        text: 'Coffee',
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.amount).toBeNull()
      expect(data.description).toBe('Coffee')
    })

    it('should support different locales', async () => {
      const mockParsed = {
        amount: 30,
        description: 'Almoço',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockParsed) } }],
      })

      const request = mockRequest({
        text: '$30 almoço',
        locale: 'pt',
      })

      const response = await parseExpenseHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.amount).toBe(30)
    })
  })
})
