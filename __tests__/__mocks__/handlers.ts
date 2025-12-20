import { http, HttpResponse } from 'msw'

// Mock API handlers for testing
export const handlers = [
  // Mock authentication endpoints
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),

  // Mock expenses API
  http.get('/api/expenses', () => {
    return HttpResponse.json({
      expenses: [
        {
          id: '1',
          amount: 50.00,
          description: 'Test Expense',
          category: 'Food & Dining',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    })
  }),

  http.post('/api/expenses', () => {
    return HttpResponse.json({
      id: '2',
      amount: 25.00,
      description: 'New Test Expense',
      category: 'Transportation',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // Mock incomes API
  http.get('/api/incomes', () => {
    return HttpResponse.json({
      incomes: [
        {
          id: '1',
          amount: 1000.00,
          description: 'Test Income',
          category: 'Salary',
          date: new Date().toISOString(),
          recurring: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    })
  }),

  // Mock invoices API
  http.get('/api/invoices', () => {
    return HttpResponse.json({
      invoices: [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          clientName: 'Test Client',
          amount: 500.00,
          status: 'PENDING',
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    })
  }),

  // Mock AI categorize endpoint
  http.post('/api/ai/categorize', async ({ request }) => {
    const body = await request.json() as { description: string; locale?: string }
    
    if (!body.description) {
      return HttpResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    // Simple categorization logic for testing
    const description = body.description.toLowerCase()
    let category = 'other'

    if (description.includes('food') || description.includes('lunch') || description.includes('dinner')) {
      category = 'foodDining'
    } else if (description.includes('uber') || description.includes('taxi') || description.includes('bus')) {
      category = 'transportation'
    } else if (description.includes('shop') || description.includes('amazon')) {
      category = 'shopping'
    }

    return HttpResponse.json({ category })
  }),

  // Mock AI insights endpoint
  http.post('/api/ai/insights', async ({ request }) => {
    const body = await request.json() as { locale?: string }

    return HttpResponse.json({
      summary: 'Your spending is under control with a healthy savings rate of 50%.',
      trends: [
        'Food & Dining is your top spending category',
        'Your expenses have been stable over the last 6 months',
      ],
      recommendations: [
        'Consider setting up automatic transfers to your savings account',
        'Look for opportunities to reduce food delivery expenses',
        'Track your transportation costs to identify patterns',
      ],
      alerts: [],
    })
  }),

  // Mock AI parse expense endpoint
  http.post('/api/ai/parse-expense', async ({ request }) => {
    const body = await request.json() as { text: string; locale?: string }
    
    if (!body.text) {
      return HttpResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Simple parsing logic for testing
    const text = body.text
    const amountMatch = text.match(/\$?(\d+\.?\d*)/)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null

    let category = 'other'
    const lowerText = text.toLowerCase()
    if (lowerText.includes('food') || lowerText.includes('lunch') || lowerText.includes('coffee')) {
      category = 'foodDining'
    } else if (lowerText.includes('uber') || lowerText.includes('taxi')) {
      category = 'transportation'
    }

    return HttpResponse.json({
      amount,
      description: text,
      category,
      date: new Date().toISOString().split('T')[0],
    })
  }),

  // Mock summary API
  http.get('/api/summary', () => {
    return HttpResponse.json({
      totals: {
        expenses: { amount: 500, count: 5 },
        incomes: { amount: 2000, count: 2 },
        invoices: { amount: 1500, count: 3 },
        netIncome: 1500,
      },
      thisMonth: {
        expenses: { amount: 200, count: 2 },
        incomes: { amount: 1000, count: 1 },
        invoices: { amount: 800, count: 2 },
        netIncome: 800,
      },
      breakdown: {
        expensesByCategory: [
          { category: 'Food & Dining', amount: 200, count: 2 },
          { category: 'Transportation', amount: 100, count: 1 },
        ],
        incomesByCategory: [
          { category: 'Salary', amount: 2000, count: 2 },
        ],
        invoicesByStatus: [
          { status: 'PAID', amount: 800, count: 2 },
          { status: 'PENDING', amount: 700, count: 1 },
        ],
      },
      trends: {
        monthlyExpenses: [],
        monthlyIncomes: [],
        monthlyInvoices: [],
      },
      recent: {
        expenses: [],
        incomes: [],
        invoices: [],
      },
      meta: {
        period: 'all',
        startDate: null,
        endDate: null,
        generatedAt: new Date().toISOString(),
      },
    })
  }),
]