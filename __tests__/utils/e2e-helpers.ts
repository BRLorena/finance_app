import { Page, expect } from '@playwright/test'

/**
 * Helper functions for E2E testing
 */

// Authentication helpers
export class AuthHelpers {
  constructor(private page: Page) {}

  async login(email?: string, password?: string) {
    const testEmail = email || process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = password || process.env.TEST_USER_PASSWORD || 'testpassword123'

    await this.page.goto('/login')
    await this.page.fill('input[name="email"]', testEmail)
    await this.page.fill('input[name="password"]', testPassword)
    await this.page.click('button[type="submit"]')
    
    // Wait for successful login redirect
    await expect(this.page).toHaveURL('/dashboard')
  }

  async logout() {
    await this.page.click('text=Sign Out')
    
    // Wait for redirect to login or home
    await expect(
      this.page.locator('text=Sign in to your account')
        .or(this.page.locator('text=Welcome to Finance App'))
    ).toBeVisible()
  }

  async register(name?: string, email?: string, password?: string) {
    const timestamp = Date.now()
    const testName = name || 'Test User'
    const testEmail = email || `test${timestamp}@example.com`
    const testPassword = password || 'password123'

    await this.page.goto('/register')
    await this.page.fill('input[name="name"]', testName)
    await this.page.fill('input[name="email"]', testEmail)
    await this.page.fill('input[name="password"]', testPassword)
    await this.page.click('button[type="submit"]')

    return { name: testName, email: testEmail, password: testPassword }
  }

  async ensureLoggedIn() {
    // Check if already logged in by trying to go to dashboard
    await this.page.goto('/dashboard')
    
    if (await this.page.locator('text=Sign in to your account').isVisible()) {
      await this.login()
    }
  }
}

// Expense management helpers
export class ExpenseHelpers {
  constructor(private page: Page) {}

  async createExpense(data: {
    amount: string
    description: string
    category: string
    date: string
  }) {
    await this.page.goto('/expenses')
    await this.page.click('button:has-text("Add Expense")')
    
    await this.page.fill('input[name="amount"]', data.amount)
    await this.page.fill('input[name="description"]', data.description)
    await this.page.selectOption('select[name="category"]', data.category)
    await this.page.fill('input[name="date"]', data.date)
    
    await this.page.click('button:has-text("Add Expense")')
    
    // Wait for success message
    await expect(this.page.locator('text=Expense added successfully')).toBeVisible()
  }

  async editExpense(originalDescription: string, newData: Partial<{
    amount: string
    description: string
    category: string
    date: string
  }>) {
    await this.page.goto('/expenses')
    
    // Find and click edit button for the expense
    const expenseItem = this.page.locator(`text=${originalDescription}`).locator('..')
    await expenseItem.locator('button[aria-label="Edit"]').click()
    
    // Update fields
    if (newData.amount) await this.page.fill('input[name="amount"]', newData.amount)
    if (newData.description) await this.page.fill('input[name="description"]', newData.description)
    if (newData.category) await this.page.selectOption('select[name="category"]', newData.category)
    if (newData.date) await this.page.fill('input[name="date"]', newData.date)
    
    await this.page.click('button:has-text("Update Expense")')
    
    // Wait for success message
    await expect(this.page.locator('text=Expense updated successfully')).toBeVisible()
  }

  async deleteExpense(description: string) {
    await this.page.goto('/expenses')
    
    // Find and click delete button
    const expenseItem = this.page.locator(`text=${description}`).locator('..')
    await expenseItem.locator('button[aria-label="Delete"]').click()
    
    // Handle confirmation dialog
    this.page.once('dialog', dialog => dialog.accept())
    
    // Wait for success message
    await expect(this.page.locator('text=Expense deleted successfully')).toBeVisible()
  }

  async filterByCategory(category: string) {
    await this.page.goto('/expenses')
    await this.page.selectOption('select:near(:text("Category"))', category)
  }

  async searchExpenses(searchTerm: string) {
    await this.page.goto('/expenses')
    await this.page.fill('input[placeholder*="Search"]', searchTerm)
  }
}

// Income management helpers
export class IncomeHelpers {
  constructor(private page: Page) {}

  async createIncome(data: {
    amount: string
    description: string
    category: string
    date: string
    recurring?: boolean
    frequency?: string
  }) {
    await this.page.goto('/incomes')
    await this.page.click('button:has-text("Add Income")')
    
    await this.page.fill('input[name="amount"]', data.amount)
    await this.page.fill('input[name="description"]', data.description)
    await this.page.selectOption('select[name="category"]', data.category)
    await this.page.fill('input[name="date"]', data.date)
    
    if (data.recurring) {
      await this.page.check('input[name="recurring"]')
      if (data.frequency) {
        await this.page.selectOption('select[name="frequency"]', data.frequency)
      }
    }
    
    await this.page.click('button:has-text("Add Income")')
    
    // Wait for success message
    await expect(this.page.locator('text=Income added successfully')).toBeVisible()
  }
}

// Invoice management helpers
export class InvoiceHelpers {
  constructor(private page: Page) {}

  async createInvoice(data: {
    clientName: string
    clientEmail: string
    amount: string
    dueDate: string
    description: string
  }) {
    await this.page.goto('/invoices')
    await this.page.click('button:has-text("Add Invoice")')
    
    await this.page.fill('input[name="clientName"]', data.clientName)
    await this.page.fill('input[name="clientEmail"]', data.clientEmail)
    await this.page.fill('input[name="amount"]', data.amount)
    await this.page.fill('input[name="dueDate"]', data.dueDate)
    await this.page.fill('textarea[name="description"]', data.description)
    
    await this.page.click('button:has-text("Create Invoice")')
    
    // Wait for success message
    await expect(this.page.locator('text=Invoice created successfully')).toBeVisible()
  }
}

// Navigation helpers
export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToDashboard() {
    await this.page.click('text=Dashboard')
    await expect(this.page).toHaveURL('/dashboard')
  }

  async goToExpenses() {
    await this.page.click('text=Expenses')
    await expect(this.page).toHaveURL('/expenses')
  }

  async goToIncomes() {
    await this.page.click('text=Incomes')
    await expect(this.page).toHaveURL('/incomes')
  }

  async goToInvoices() {
    await this.page.click('text=Invoices')
    await expect(this.page).toHaveURL('/invoices')
  }
}

// Wait helpers
export class WaitHelpers {
  constructor(private page: Page) {}

  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle')
    
    // Wait for any loading indicators to disappear
    const loadingSelectors = [
      '.animate-spin',
      '.loading',
      '[data-testid="loading"]',
      'text=Loading...'
    ]
    
    for (const selector of loadingSelectors) {
      const element = this.page.locator(selector)
      if (await element.isVisible()) {
        await element.waitFor({ state: 'hidden', timeout: 10000 })
      }
    }
  }

  async waitForToast(message?: string) {
    if (message) {
      await expect(this.page.locator(`text=${message}`)).toBeVisible()
    } else {
      // Wait for any toast message
      await expect(
        this.page.locator('[data-testid="toast"], .toast, [role="alert"]')
      ).toBeVisible()
    }
  }
}

// Utility function to create test helpers for a page
export function createTestHelpers(page: Page) {
  return {
    auth: new AuthHelpers(page),
    expenses: new ExpenseHelpers(page),
    incomes: new IncomeHelpers(page),
    invoices: new InvoiceHelpers(page),
    navigation: new NavigationHelpers(page),
    wait: new WaitHelpers(page),
  }
}

// Common test data generators
export const testData = {
  expense: (overrides?: Partial<any>) => ({
    amount: '50.00',
    description: 'Test Expense',
    category: 'Food & Dining',
    date: '2025-11-07',
    ...overrides,
  }),

  income: (overrides?: Partial<any>) => ({
    amount: '1000.00',
    description: 'Test Income',
    category: 'Salary',
    date: '2025-11-07',
    recurring: false,
    ...overrides,
  }),

  invoice: (overrides?: Partial<any>) => ({
    clientName: 'Test Client',
    clientEmail: 'client@example.com',
    amount: '500.00',
    dueDate: '2025-12-07',
    description: 'Test Invoice',
    ...overrides,
  }),

  user: (overrides?: Partial<any>) => ({
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  }),
}