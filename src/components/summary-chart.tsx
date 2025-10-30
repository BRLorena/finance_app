"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    fetchSummaryData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const fetchSummaryData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (period !== "all") {
        params.append("period", period)
        
        // Add current year and month for period filtering
        const now = new Date()
        if (period === "month") {
          params.append("year", now.getFullYear().toString())
          params.append("month", (now.getMonth() + 1).toString())
        } else if (period === "year") {
          params.append("year", now.getFullYear().toString())
        }
      }
      
      const response = await fetch(`/api/summary?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch summary data")
      }
      
      const summaryData = await response.json()
      setData(summaryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
          <p className="text-red-600 mb-4">Error loading summary: {error}</p>
          <Button onClick={fetchSummaryData} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {["all", "month", "year"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            onClick={() => handlePeriodChange(p)}
            className="capitalize"
          >
            {p === "all" ? "All Time" : `This ${p}`}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
              Total Income
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
              {data.totals.incomes.count} income entries recorded
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
              Total Expenses
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
              {data.totals.expenses.count} expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Net Income
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
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">
              This Month
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
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income by Category */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              Income by Category
            </CardTitle>
            <CardDescription>
              Breakdown of your income by category
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
              <p className="text-gray-500 text-center py-8">No income data available</p>
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
              Breakdown of your expenses by category
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
              Invoices by Status
            </CardTitle>
            <CardDescription>
              Status breakdown of your invoices
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
              <p className="text-gray-500 text-center py-8">No invoice data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Income */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              Recent Income
            </CardTitle>
            <CardDescription>
              Your latest income entries
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
              <p className="text-gray-500 text-center py-8">No recent income</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              Recent Expenses
            </CardTitle>
            <CardDescription>
              Your latest expense entries
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
              <p className="text-gray-500 text-center py-8">No recent expenses</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📄</span>
              Recent Invoices
            </CardTitle>
            <CardDescription>
              Your latest invoice entries
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
              <p className="text-gray-500 text-center py-8">No recent invoices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}