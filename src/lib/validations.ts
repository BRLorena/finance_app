import { z } from "zod"

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Expense validation schemas
export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
})

export const expenseFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
})

// Income validation schemas
export const incomeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.date(),
  recurring: z.boolean().default(false),
  frequency: z.string().optional(),
})

export const incomeFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  recurring: z.boolean(),
  frequency: z.string().optional(),
})

// Invoice validation schemas
export const invoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid client email").optional(),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.date(),
  issueDate: z.date().default(() => new Date()),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional(),
})

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid client email").optional().or(z.literal("")),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  notes: z.string().optional(),
})

// Summary validation schemas
export const summaryParamsSchema = z.object({
  period: z.enum(["all", "month", "year"]).default("all"),
  year: z.string().optional().refine((val) => {
    if (!val) return true
    const year = parseInt(val)
    return year >= 1900 && year <= new Date().getFullYear() + 10
  }, "Invalid year"),
  month: z.string().optional().refine((val) => {
    if (!val) return true
    const month = parseInt(val)
    return month >= 1 && month <= 12
  }, "Invalid month (1-12)"),
})

export const summaryQuerySchema = z.object({
  period: z.enum(["all", "month", "year"]).optional(),
  year: z.string().regex(/^\d{4}$/, "Year must be 4 digits").optional(),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, "Month must be 1-12").optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// Date range validation schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start <= end
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"],
})

// Types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type ExpenseFormInput = z.infer<typeof expenseFormSchema>
export type IncomeInput = z.infer<typeof incomeSchema>
export type IncomeFormInput = z.infer<typeof incomeFormSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>
export type SummaryParamsInput = z.infer<typeof summaryParamsSchema>
export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>