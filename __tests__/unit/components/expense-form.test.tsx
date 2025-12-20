import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpenseForm } from '@/components/expense-form'

// Mock the toast function
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('ExpenseForm Component', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders the form with all required fields', () => {
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByRole('heading', { name: 'addExpense' })).toBeInTheDocument()
    expect(screen.getByLabelText('amount')).toBeInTheDocument()
    expect(screen.getByLabelText('description')).toBeInTheDocument()
    expect(screen.getByLabelText('category')).toBeInTheDocument()
    expect(screen.getByLabelText('date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'addExpense' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  it.skip('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: 'addExpense' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      expect(screen.getByText(/category is required/i)).toBeInTheDocument()
      expect(screen.getByText(/date is required/i)).toBeInTheDocument()
    })
  })

  it.skip('validates amount is a positive number', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const amountInput = screen.getByLabelText('amount')
    await user.type(amountInput, '-10')
    
    const submitButton = screen.getByRole('button', { name: 'addExpense' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount must be a positive number/i)).toBeInTheDocument()
    })
  })

  it.skip('submits form with valid data', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', amount: 50.00, description: 'Test expense' }),
    })

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText('amount'), '50.00')
    await user.type(screen.getByLabelText('description'), 'Test expense')
    await user.selectOptions(screen.getByLabelText('category'), 'foodDining')
    await user.type(screen.getByLabelText('date'), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: 'addExpense' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50.00,
          description: 'Test expense',
          category: 'foodDining',
          date: '2025-11-07',
        }),
      })
    })
    
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it.skip('handles form submission errors', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    })

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText('amount'), '50.00')
    await user.type(screen.getByLabelText('description'), 'Test expense')
    await user.selectOptions(screen.getByLabelText('category'), 'foodDining')
    await user.type(screen.getByLabelText('date'), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: 'addExpense' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: 'cancel' })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it.skip('pre-fills form when editing an expense', () => {
    const existingExpense = {
      id: '1',
      amount: 75.50,
      description: 'Existing expense',
      category: 'Transportation',
      date: new Date('2025-11-07'),
    }
    
    render(<ExpenseForm expense={existingExpense} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByRole('heading', { name: 'editExpense' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('75.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing expense')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Transportation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2025-11-07')).toBeInTheDocument()
  })

  it.skip('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
    )

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText('amount'), '50.00')
    await user.type(screen.getByLabelText('description'), 'Test expense')
    await user.selectOptions(screen.getByLabelText('category'), 'foodDining')
    await user.type(screen.getByLabelText('date'), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: 'addExpense' })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByRole('button', { name: 'adding' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'adding' })).toBeDisabled()
  })
})