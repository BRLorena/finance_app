import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/components/auth-provider'

// Mock session data for testing
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

// Mock authenticated session
export const mockAuthenticatedSession = mockSession

// Mock unauthenticated session
export const mockUnauthenticatedSession = null

// Custom render function that includes providers
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Helper function to create mock API responses
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(data),
  text: jest.fn().mockResolvedValue(JSON.stringify(data)),
})

// Helper function to create mock fetch
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue(createMockResponse(response, status))
}

// Helper function to create test expense data
export const createTestExpense = (overrides: Partial<any> = {}) => ({
  id: 'test-expense-1',
  amount: 50.00,
  description: 'Test Expense',
  category: 'Food & Dining',
  date: new Date('2025-11-07'),
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper function to create test income data
export const createTestIncome = (overrides: Partial<any> = {}) => ({
  id: 'test-income-1',
  amount: 1000.00,
  description: 'Test Income',
  category: 'Salary',
  date: new Date('2025-11-07'),
  recurring: false,
  frequency: null,
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper function to create test invoice data
export const createTestInvoice = (overrides: Partial<any> = {}) => ({
  id: 'test-invoice-1',
  invoiceNumber: 'INV-001',
  clientName: 'Test Client',
  clientEmail: 'client@example.com',
  amount: 500.00,
  status: 'PENDING',
  dueDate: new Date('2025-12-07'),
  description: 'Test Invoice',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper function to create test user data
export const createTestUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper function to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper function to create mock form data
export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Helper function to mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  const mockedConsole = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }
  
  Object.assign(console, mockedConsole)
  
  return {
    restore: () => Object.assign(console, originalConsole),
    mocks: mockedConsole,
  }
}

// Helper function to mock localStorage
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {}
  
  const mockStorage = {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key]
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    }),
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })
  
  return mockStorage
}

// Helper function to create mock file
export const createMockFile = (name = 'test.txt', type = 'text/plain', content = 'test content') => {
  return new File([content], name, { type })
}

// Helper function to simulate user input
export const simulateUserInput = {
  type: async (element: HTMLElement, text: string) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(element, { target: { value: text } })
  },
  click: async (element: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(element)
  },
  submit: async (form: HTMLElement) => {
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.submit(form)
  },
}

// Export all utilities
export * from '@testing-library/react'
export { renderWithProviders as render }