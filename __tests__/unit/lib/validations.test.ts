import { 
  registerSchema, 
  loginSchema, 
  expenseSchema, 
  expenseFormSchema,
  incomeSchema,
  incomeFormSchema
} from '@/lib/validations'

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('rejects short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters')
      }
    })

    it('rejects short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })
  })

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })
  })

  describe('expenseSchema', () => {
    it('validates correct expense data', () => {
      const validData = {
        amount: 50.00,
        description: 'Lunch expense',
        category: 'Food & Dining',
        date: new Date('2025-11-07'),
      }
      
      const result = expenseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects negative amount', () => {
      const invalidData = {
        amount: -50.00,
        description: 'Lunch expense',
        category: 'Food & Dining',
        date: new Date('2025-11-07'),
      }
      
      const result = expenseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be positive')
      }
    })

    it('rejects zero amount', () => {
      const invalidData = {
        amount: 0,
        description: 'Lunch expense',
        category: 'Food & Dining',
        date: new Date('2025-11-07'),
      }
      
      const result = expenseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be positive')
      }
    })

    it('rejects empty description', () => {
      const invalidData = {
        amount: 50.00,
        description: '',
        category: 'Food & Dining',
        date: new Date('2025-11-07'),
      }
      
      const result = expenseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Description is required')
      }
    })
  })

  describe('expenseFormSchema', () => {
    it('validates correct form data', () => {
      const validData = {
        amount: '50.00',
        description: 'Lunch expense',
        category: 'Food & Dining',
        date: '2025-11-07',
      }
      
      const result = expenseFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty amount string', () => {
      const invalidData = {
        amount: '',
        description: 'Lunch expense',
        category: 'Food & Dining',
        date: '2025-11-07',
      }
      
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount is required')
      }
    })
  })

  describe('incomeSchema', () => {
    it('validates correct income data', () => {
      const validData = {
        amount: 1000.00,
        description: 'Salary',
        category: 'Salary',
        date: new Date('2025-11-07'),
        recurring: true,
        frequency: 'monthly',
      }
      
      const result = incomeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates income without recurring fields', () => {
      const validData = {
        amount: 500.00,
        description: 'Freelance project',
        category: 'Freelance',
        date: new Date('2025-11-07'),
        recurring: false,
      }
      
      const result = incomeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('defaults recurring to false', () => {
      const validData = {
        amount: 500.00,
        description: 'Freelance project',
        category: 'Freelance',
        date: new Date('2025-11-07'),
      }
      
      const result = incomeSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.recurring).toBe(false)
      }
    })
  })

  describe('incomeFormSchema', () => {
    it('validates correct form data with recurring', () => {
      const validData = {
        amount: '1000.00',
        description: 'Salary',
        category: 'Salary',
        date: '2025-11-07',
        recurring: true,
        frequency: 'monthly',
      }
      
      const result = incomeFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates form data without recurring', () => {
      const validData = {
        amount: '500.00',
        description: 'Freelance project',
        category: 'Freelance',
        date: '2025-11-07',
        recurring: false,
      }
      
      const result = incomeFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})