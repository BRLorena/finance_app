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