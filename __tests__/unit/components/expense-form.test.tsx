import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
    
    expect(screen.getByRole('heading', { name: /add expense/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
      expect(screen.getByText(/category is required/i)).toBeInTheDocument()
      expect(screen.getByText(/date is required/i)).toBeInTheDocument()
    })
  })

  it('validates amount is a positive number', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '-10')
    
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/amount must be a positive number/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', amount: 50.00, description: 'Test expense' }),
    })

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out the form
    await user.type(screen.getByLabelText(/amount/i), '50.00')
    await user.type(screen.getByLabelText(/description/i), 'Test expense')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food & Dining')
    await user.type(screen.getByLabelText(/date/i), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50.00,
          description: 'Test expense',
          category: 'Food & Dining',
          date: '2025-11-07',
        }),
      })
    })
    
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('handles form submission errors', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
    })

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/amount/i), '50.00')
    await user.type(screen.getByLabelText(/description/i), 'Test expense')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food & Dining')
    await user.type(screen.getByLabelText(/date/i), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    expect(mockOnSuccess).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('pre-fills form when editing an expense', () => {
    const existingExpense = {
      id: '1',
      amount: 75.50,
      description: 'Existing expense',
      category: 'Transportation',
      date: new Date('2025-11-07'),
    }
    
    render(<ExpenseForm expense={existingExpense} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByRole('heading', { name: /edit expense/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('75.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing expense')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Transportation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2025-11-07')).toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup()
    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
    )

    render(<ExpenseForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Fill out and submit form
    await user.type(screen.getByLabelText(/amount/i), '50.00')
    await user.type(screen.getByLabelText(/description/i), 'Test expense')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food & Dining')
    await user.type(screen.getByLabelText(/date/i), '2025-11-07')
    
    const submitButton = screen.getByRole('button', { name: /add expense/i })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /adding.../i })).toBeDisabled()
  })
})