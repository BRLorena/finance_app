import { cn, formatCurrency, formatDate } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('resolves Tailwind conflicts correctly', () => {
      // twMerge should resolve conflicts, keeping the last one
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600')
    })

    it('handles arrays and objects', () => {
      expect(cn(['class-1', 'class-2'])).toBe('class-1 class-2')
      expect(cn({ 'active': true, 'disabled': false })).toBe('active')
    })

    it('filters out falsy values', () => {
      expect(cn('class-1', null, undefined, 'class-2')).toBe('class-1 class-2')
    })
  })

  describe('formatCurrency', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(50.99)).toBe('$50.99')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('formats negative amounts correctly', () => {
      expect(formatCurrency(-100)).toBe('-$100.00')
      expect(formatCurrency(-50.99)).toBe('-$50.99')
    })

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
      expect(formatCurrency(999999.99)).toBe('$999,999.99')
    })

    it('handles decimal precision', () => {
      expect(formatCurrency(10.1)).toBe('$10.10')
      expect(formatCurrency(10.123)).toBe('$10.12') // Should round to 2 decimal places
    })
  })

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2025-11-07T10:30:00Z')
      const formatted = formatDate(date)
      
      // The exact format might vary by system locale, but should contain these elements
      expect(formatted).toMatch(/Nov|11/)
      expect(formatted).toMatch(/7/)
      expect(formatted).toMatch(/2025/)
    })

    it('formats different dates consistently', () => {
      const jan1 = new Date('2025-01-01T00:00:00Z')
      const dec31 = new Date('2025-12-31T23:59:59Z')
      
      const formattedJan = formatDate(jan1)
      const formattedDec = formatDate(dec31)
      
      expect(formattedJan).toMatch(/Jan|1/)
      expect(formattedJan).toMatch(/1/)
      expect(formattedJan).toMatch(/2025/)
      
      expect(formattedDec).toMatch(/Dec|12/)
      expect(formattedDec).toMatch(/31/)
      expect(formattedDec).toMatch(/2025/)
    })

    it('handles invalid dates', () => {
      const invalidDate = new Date('invalid')
      
      // Invalid dates should throw when trying to format them
      expect(() => formatDate(invalidDate)).toThrow('Invalid time value')
    })

    it('formats leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00Z') // 2024 is a leap year
      const formatted = formatDate(leapDay)
      
      expect(formatted).toMatch(/Feb|2/)
      expect(formatted).toMatch(/29/)
      expect(formatted).toMatch(/2024/)
    })
  })
})