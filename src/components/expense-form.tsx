"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { expenseFormSchema, type ExpenseFormInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useTranslations, useLocale } from 'next-intl'

interface ExpenseFormProps {
  expense?: {
    id: string
    amount: number
    description: string
    category: string
    date: Date
  }
  onSuccess?: () => void
  onCancel?: () => void
}

const categories = [
  "foodDining",
  "transportation",
  "shopping",
  "entertainment",
  "billsUtilities",
  "healthcare",
  "travel",
  "education",
  "business",
  "other",
]

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCategorizingAI, setIsCategorizingAI] = useState(false)
  const [showNaturalLanguage, setShowNaturalLanguage] = useState(false)
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const t = useTranslations('expenses')
  const tCommon = useTranslations('common')
  const tAI = useTranslations('ai')
  const locale = useLocale()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? {
          amount: expense.amount.toString(),
          description: expense.description,
          category: expense.category,
          date: expense.date.toISOString().split('T')[0],
        }
      : {
          date: new Date().toISOString().split('T')[0],
        },
  })

  const description = watch('description')

  const handleAICategory = async () => {
    if (!description || description.trim().length === 0) {
      toast.error('Please enter a description first')
      return
    }

    setIsCategorizingAI(true)
    
    try {
      const response = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, locale }),
      })

      if (!response.ok) {
        throw new Error('Failed to categorize expense')
      }

      const { category } = await response.json()
      setValue('category', category)
      toast.success(`AI suggested: ${category}`)
    } catch (error) {
      console.error('Error with AI categorization:', error)
      toast.error('Failed to get AI suggestion. Make sure Ollama is running.')
    } finally {
      setIsCategorizingAI(false)
    }
  }

  const handleParseNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter some text to parse')
      return
    }

    setIsParsing(true)
    
    try {
      const response = await fetch('/api/ai/parse-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: naturalLanguageInput, locale }),
      })

      if (!response.ok) {
        throw new Error('Failed to parse expense')
      }

      const parsed = await response.json()
      
      // Fill in the form with parsed data
      if (parsed.amount) setValue('amount', parsed.amount.toString())
      if (parsed.description) setValue('description', parsed.description)
      if (parsed.category) setValue('category', parsed.category)
      if (parsed.date) setValue('date', parsed.date)
      
      setShowNaturalLanguage(false)
      setNaturalLanguageInput("")
      toast.success('Expense parsed successfully!')
    } catch (error) {
      console.error('Error parsing expense:', error)
      toast.error('Failed to parse expense. Make sure Ollama is running.')
    } finally {
      setIsParsing(false)
    }
  }

  const onSubmit = async (data: ExpenseFormInput) => {
    setIsLoading(true)
    
    try {
      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses'
      const method = expense ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Something went wrong')
      }

      toast.success(expense ? 'Expense updated successfully!' : 'Expense created successfully!')
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {expense ? t('editExpense') : t('addExpense')}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {expense ? t('updateDetails') : t('trackByAdding')}
            </CardDescription>
          </div>
          {!expense && (
            <Button
              type="button"
              onClick={() => setShowNaturalLanguage(!showNaturalLanguage)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {showNaturalLanguage ? t('useForm') : t('quickAdd')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showNaturalLanguage ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-200 mb-2">
                💡 {t('naturalLanguageHint')}
              </p>
              <ul className="text-xs text-gray-300 space-y-1 ml-4">
                <li>• &quot;{t('examples.groceries')}&quot;</li>
                <li>• &quot;{t('examples.uber')}&quot;</li>
                <li>• &quot;{t('examples.coffee')}&quot;</li>
                <li>• &quot;{t('examples.dinner')}&quot;</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="natural-input" className="text-sm font-medium text-gray-200">
                {t('describeExpense')}
              </Label>
              <textarea
                id="natural-input"
                rows={3}
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleParseNaturalLanguage}
                disabled={isParsing || !naturalLanguageInput.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
              >
                {isParsing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {tAI('parsing')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('parseWithAI')}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowNaturalLanguage(false)
                  setNaturalLanguageInput("")
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-200">
                {t('amount')}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-400 text-sm">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-200">
                {t('date')}
              </Label>
              <Input
                id="date"
                type="date"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("date")}
              />
              {errors.date && (
                <p className="text-red-400 text-sm">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-200">
              {t('description')}
            </Label>
            <Input
              id="description"
              placeholder={t('descriptionPlaceholder')}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-sm font-medium text-gray-200">
                {t('category')}
              </Label>
              <Button
                type="button"
                onClick={handleAICategory}
                disabled={isCategorizingAI || !description}
                className="h-8 px-3 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isCategorizingAI ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {tAI('aiSuggesting')}
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('aiSuggest')}
                  </>
                )}
              </Button>
            </div>
            <select
              id="category"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none"
              {...register("category")}
            >
              <option value="" className="bg-gray-800 text-white">
                {t('selectCategory')}
              </option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {t(`categories.${category}`)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm">{errors.category.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? tCommon('save') + '...' : expense ? t('updateExpense') : t('addExpense')}
            </Button>
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {tCommon('cancel')}
              </Button>
            )}
          </div>
        </form>        )}      </CardContent>
    </Card>
  )
}