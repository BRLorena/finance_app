"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'

// Simple cache for summary data to reduce API calls
const summaryCache = new Map<string, { data: SummaryData; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

type SummaryData = {
  totals: {
    expenses: { amount: number; count: number }
    incomes: { amount: number; count: number }
    invoices: { amount: number; count: number }
    netIncome: number
  }
  thisMonth: {
    expenses: { amount: number; count: number }
    incomes: { amount: number; count: number }
    invoices: { amount: number; count: number }
    netIncome: number
  }
  breakdown: {
    expensesByCategory: Array<{ category: string; amount: number; count: number }>
    incomesByCategory: Array<{ category: string; amount: number; count: number }>
    invoicesByStatus: Array<{ status: string; amount: number; count: number }>
  }
  trends: {
    monthlyExpenses: Array<{ month: string; total: number; count: number }>
    monthlyIncomes: Array<{ month: string; total: number; count: number }>
    monthlyInvoices: Array<{ month: string; total: number; count: number }>
  }
  recent: {
    expenses: Array<{
      id: string
      amount: number
      description: string
      category: string
      date: string
      createdAt: string
    }>
    incomes: Array<{
      id: string
      amount: number
      description: string
      category: string
      date: string
      createdAt: string
    }>
    invoices: Array<{
      id: string
      invoiceNumber: string | null
      clientName: string
      amount: number
      status: string
      dueDate: string
      createdAt: string
    }>
  }
  meta: {
    period: string
    startDate: string | null
    endDate: string | null
    generatedAt: string
  }
}

type SummaryChartProps = {
  period?: string
  onPeriodChange?: (period: string) => void
}

export function SummaryChart({ period: initialPeriod = "all", onPeriodChange }: SummaryChartProps) {
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(initialPeriod)
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false)
  const [isRecentExpanded, setIsRecentExpanded] = useState(false)
  const t = useTranslations('summary')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  
  // Map next-intl locales to browser locales for date formatting
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'pt': 'pt-BR',
    'es': 'es-ES',
    'fr': 'fr-FR'
  }
  
  // Ref for abort controller to cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchSummaryData = useCallback(async (skipCache = false) => {
    // Build cache key
    const params = new URLSearchParams()
    if (period !== "all") {
      params.append("period", period)
      const now = new Date()
      if (period === "month") {
        params.append("year", now.getFullYear().toString())
        params.append("month", (now.getMonth() + 1).toString())
      } else if (period === "year") {
        params.append("year", now.getFullYear().toString())
      }
    }
    const cacheKey = params.toString() || 'all'
    
    // Check cache first (unless skip requested)
    if (!skipCache) {
      const cached = summaryCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/summary?${params}`, {
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch summary data")
      }
      
      const summaryData = await response.json()
      
      // Update cache
      summaryCache.set(cacheKey, { data: summaryData, timestamp: Date.now() })
      
      setData(summaryData)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return
      }
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchSummaryData()
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSummaryData])

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(localeMap[locale] || 'en-US', {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(localeMap[locale] || 'en-US', {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">{tCommon('error')}: {error}</p>
          <Button onClick={() => fetchSummaryData(true)} variant="outline">
            {tCommon('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{tCommon('noData')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={period === "all" ? "default" : "outline"}
          onClick={() => handlePeriodChange("all")}
          className="capitalize"
        >
          {t('allTime')}
        </Button>
        <Button
          variant={period === "month" ? "default" : "outline"}
          onClick={() => handlePeriodChange("month")}
          className="capitalize"
        >
          {t('thisMonth')}
        </Button>
        <Button
          variant={period === "year" ? "default" : "outline"}
          onClick={() => handlePeriodChange("year")}
          className="capitalize"
        >
          {t('thisYear')}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
              {t('totalIncome')}
            </CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">📈</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(data.totals.incomes.amount)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {t('incomeEntries', { count: data.totals.incomes.count })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
              {t('totalExpenses')}
            </CardTitle>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">📉</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(data.totals.expenses.amount)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              {t('expenses', { count: data.totals.expenses.count })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {t('netIncome')}
            </CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.totals.netIncome >= 0 
                ? "text-blue-700 dark:text-blue-300" 
                : "text-red-700 dark:text-red-300"
            }`}>
              {formatCurrency(data.totals.netIncome)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {t('revenueMinusExpenses')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">
              {t('thisMonth')}
            </CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">📅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.thisMonth.netIncome >= 0 
                ? "text-purple-700 dark:text-purple-300" 
                : "text-red-700 dark:text-red-300"
            }`}>
              {formatCurrency(data.thisMonth.netIncome)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {new Date().toLocaleDateString(localeMap[locale] || 'en-US', { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Charts */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="relative">
          <div 
            className="cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-4 -m-4"
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {t('categoryBreakdown')}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    {isBreakdownExpanded ? t('categoryBreakdownSubtitle') : t('categoryBreakdownCollapsed')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isBreakdownExpanded ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsBreakdownExpanded(false)
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Collapse"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                ) : (
                  <svg 
                    className="w-6 h-6 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        {isBreakdownExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              {t('incomeByCategory')}
            </CardTitle>
            <CardDescription>
              {t('incomeBreakdownDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.breakdown.incomesByCategory.length > 0 ? (
              <div className="space-y-4">
                {data.breakdown.incomesByCategory.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: `hsl(${(index * 137.5 + 120) % 360}, 70%, 50%)`
                        }}
                      />
                      <span className="font-medium capitalize">{item.category}</span>
                      <span className="text-sm text-gray-500">({item.count})</span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t('noIncomeData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              Expenses by Category
            </CardTitle>
            <CardDescription>
              {t('expensesBreakdownDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.breakdown.expensesByCategory.length > 0 ? (
              <div className="space-y-4">
                {data.breakdown.expensesByCategory.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                        }}
                      />
                      <span className="font-medium capitalize">{item.category}</span>
                      <span className="text-sm text-gray-500">({item.count})</span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expense data available</p>
            )}
          </CardContent>
        </Card>

        {/* Invoices by Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🧾</span>
              {t('invoicesByStatus')}
            </CardTitle>
            <CardDescription>
              {t('invoicesBreakdownDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.breakdown.invoicesByStatus.length > 0 ? (
              <div className="space-y-4">
                {data.breakdown.invoicesByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-4 h-4 rounded ${
                          item.status === "PAID" ? "bg-green-500" :
                          item.status === "PENDING" ? "bg-yellow-500" :
                          item.status === "OVERDUE" ? "bg-red-500" :
                          "bg-gray-500"
                        }`}
                      />
                      <span className="font-medium capitalize">{item.status.toLowerCase()}</span>
                      <span className="text-sm text-gray-500">({item.count})</span>
                    </div>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t('noInvoiceData')}</p>
            )}
          </CardContent>
        </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Activities */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="relative">
          <div 
            className="cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-4 -m-4"
            onClick={() => setIsRecentExpanded(!isRecentExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {t('recentActivities')}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    {isRecentExpanded ? t('recentActivitiesSubtitle') : t('recentActivitiesCollapsed')}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isRecentExpanded ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsRecentExpanded(false)
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Collapse"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                ) : (
                  <svg 
                    className="w-6 h-6 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        {isRecentExpanded && (
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Income */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    {t('recentIncome')}
                  </CardTitle>
                  <CardDescription>
                    {t('recentIncomeDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent.incomes.length > 0 ? (
                    <div className="space-y-3">
                      {data.recent.incomes.map((income) => (
                        <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-200">{income.description}</p>
                            <p className="text-sm text-gray-400">
                              {income.category} • {formatDate(income.date)}
                            </p>
                          </div>
                          <span className="font-bold text-green-300">
                            +{formatCurrency(income.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t('noRecentIncome')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Expenses */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    {t('recentExpenses')}
                  </CardTitle>
                  <CardDescription>
                    {t('recentExpensesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent.expenses.length > 0 ? (
                    <div className="space-y-3">
                      {data.recent.expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-200">{expense.description}</p>
                            <p className="text-sm text-gray-400">
                              {expense.category} • {formatDate(expense.date)}
                            </p>
                          </div>
                          <span className="font-bold text-red-300">
                            -{formatCurrency(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t('noRecentExpenses')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    {t('recentInvoices')}
                  </CardTitle>
                  <CardDescription>
                    {t('recentInvoicesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recent.invoices.length > 0 ? (
                    <div className="space-y-3">
                      {data.recent.invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-200">{invoice.clientName}</p>
                            <p className="text-sm text-gray-400">
                              {invoice.invoiceNumber} • {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-300">
                              {formatCurrency(invoice.amount)}
                            </p>
                            <p className={`text-xs font-medium ${
                              invoice.status === "PAID" ? "text-green-600" :
                              invoice.status === "PENDING" ? "text-yellow-600" :
                              invoice.status === "OVERDUE" ? "text-red-600" :
                              "text-gray-600"
                            }`}>
                              {invoice.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">{t('noRecentInvoices')}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}