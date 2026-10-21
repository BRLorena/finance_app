/**
 * Unit tests for Groq AI functions
 */

// Mock the groq-sdk module before importing
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

import {
  generateAI,
  categorizeExpense,
  generateFinancialInsights,
  parseExpenseFromText,
  isAIAvailable,
  getAIProvider,
} from '@/lib/groq'

describe('Groq AI Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.GROQ_API_KEY = 'test-api-key'
    process.env.GROQ_MODEL = 'llama-3.3-70b-versatile'
  })

  afterEach(() => {
    delete process.env.GROQ_API_KEY
    delete process.env.GROQ_MODEL
  })

  describe('generateAI', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated response',
            },
          },
        ],
      }

      mockChatCompletions.create.mockResolvedValue(mockResponse)

      const result = await generateAI('Test prompt', 0.5)

      expect(result).toBe('Generated response')
      expect(mockChatCompletions.create).toHaveBeenCalledWith({
        messages: [
          {
            role: 'user',
            content: 'Test prompt',
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 1024,
      })
    })

    it('should handle API errors', async () => {
      mockChatCompletions.create.mockRejectedValue(new Error('API Error'))

      await expect(generateAI('Test prompt')).rejects.toThrow(
        'Failed to generate response from Groq'
      )
    })
  })

  describe('categorizeExpense', () => {
    it('should categorize food expense correctly', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '1' } }],
      })

      const result = await categorizeExpense('Lunch at Chipotle', 'en')

      expect(result).toBe('foodDining')
    })

    it('should categorize transportation expense', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '2' } }],
      })

      const result = await categorizeExpense('Uber ride', 'en')

      expect(result).toBe('transportation')
    })

    it('should default to other for invalid category', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '99' } }],
      })

      const result = await categorizeExpense('Unknown expense', 'en')

      expect(result).toBe('other')
    })

    it('should handle non-numeric responses', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: 'invalid response' } }],
      })

      const result = await categorizeExpense('Test', 'en')

      expect(result).toBe('other')
    })

    it('should support different locales', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: '1' } }],
      })

      await categorizeExpense('Almoço', 'pt')

      const callArgs = mockChatCompletions.create.mock.calls[0][0]
      expect(callArgs.messages[0].content).toContain('assistente de categorização financeira')
    })
  })

  describe('generateFinancialInsights', () => {
    const mockData = {
      totalExpenses: 1500,
      totalIncome: 3000,
      expensesByCategory: [
        { category: 'foodDining', total: 500, count: 10 },
        { category: 'transportation', total: 300, count: 5 },
        { category: 'shopping', total: 700, count: 8 },
      ],
      monthlyTrend: [
        { month: 'Nov 2024', total: 1400 },
        { month: 'Dec 2024', total: 1500 },
      ],
      previousMonthTotal: 1400,
      currentMonthTotal: 1500,
    }

    it('should generate financial insights successfully', async () => {
      const mockResponse = {
        summary: 'You have good financial health',
        trends: ['Spending is stable', 'Top category is shopping'],
        recommendations: ['Save 20% of income', 'Reduce shopping'],
        alerts: [],
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      })

      const result = await generateFinancialInsights(mockData, 'en')

      expect(result).toEqual(mockResponse)
      expect(result.summary).toBeTruthy()
      expect(result.trends).toHaveLength(2)
      expect(result.recommendations).toHaveLength(2)
    })

    it('should handle JSON with markdown code blocks', async () => {
      const mockResponse = {
        summary: 'Test summary',
        trends: ['Trend 1'],
        recommendations: ['Tip 1'],
        alerts: [],
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
            },
          },
        ],
      })

      const result = await generateFinancialInsights(mockData, 'en')

      expect(result).toEqual(mockResponse)
    })

    it('should return fallback insights on error', async () => {
      mockChatCompletions.create.mockRejectedValue(new Error('API Error'))

      const result = await generateFinancialInsights(mockData, 'en')

      expect(result.summary).toContain('$1500.00')
      expect(result.trends).toBeInstanceOf(Array)
      expect(result.recommendations).toBeInstanceOf(Array)
      expect(result.alerts).toBeInstanceOf(Array)
    })

    it('should include alerts for high spending increase', async () => {
      mockChatCompletions.create.mockRejectedValue(new Error('API Error'))

      const dataWithHighIncrease = {
        ...mockData,
        previousMonthTotal: 1000,
        currentMonthTotal: 1500,
      }

      const result = await generateFinancialInsights(dataWithHighIncrease, 'en')

      expect(result.alerts.length).toBeGreaterThan(0)
    })
  })

  describe('parseExpenseFromText', () => {
    it('should parse complete expense text', async () => {
      const mockResponse = {
        amount: 45.99,
        description: 'Groceries at Whole Foods',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      })

      const result = await parseExpenseFromText(
        'Spent $45.99 on groceries at Whole Foods',
        'en'
      )

      expect(result.amount).toBe(45.99)
      expect(result.description).toBe('Groceries at Whole Foods')
      expect(result.category).toBe('foodDining')
      expect(result.date).toBe('2024-12-20')
    })

    it('should handle text without amount', async () => {
      const mockResponse = {
        amount: null,
        description: 'Coffee',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      })

      const result = await parseExpenseFromText('Coffee', 'en')

      expect(result.amount).toBeNull()
      expect(result.description).toBe('Coffee')
    })

    it('should handle JSON parsing errors with fallback', async () => {
      mockChatCompletions.create.mockResolvedValue({
        choices: [{ message: { content: 'invalid json' } }],
      })

      const result = await parseExpenseFromText('$25 coffee', 'en')

      expect(result.amount).toBe(25)
      expect(result.description).toBe('$25 coffee')
      expect(result.category).toBeNull()
      expect(result.date).toBeTruthy()
    })

    it('should clean markdown code blocks from response', async () => {
      const mockResponse = {
        amount: 30,
        description: 'Lunch',
        categoryNumber: 1,
        date: '2024-12-20',
      }

      mockChatCompletions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
            },
          },
        ],
      })

      const result = await parseExpenseFromText('$30 lunch', 'en')

      expect(result.amount).toBe(30)
      expect(result.category).toBe('foodDining')
    })
  })

  describe('isAIAvailable', () => {
    it('should return true when API key is set', () => {
      process.env.GROQ_API_KEY = 'test-key'
      expect(isAIAvailable()).toBe(true)
    })

    it('should return false when API key is not set', () => {
      delete process.env.GROQ_API_KEY
      expect(isAIAvailable()).toBe(false)
    })
  })

  describe('getAIProvider', () => {
    it('should return provider name with model', () => {
      const provider = getAIProvider()
      expect(provider).toContain('Groq')
      expect(provider).toContain('llama')
    })
  })
})
