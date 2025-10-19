"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardData = {
  totals: {
    expenses: { amount: number; count: number }
    invoices: { amount: number; count: number }
    netIncome: number
  }
  thisMonth: {
    expenses: { amount: number; count: number }
    invoices: { amount: number; count: number }
    netIncome: number
  }
  recent: {
    expenses: Array<{
      id: string
      amount: number
      description: string
      category: string
      date: string
    }>
    invoices: Array<{
      id: string
      invoiceNumber: string | null
      clientName: string
      amount: number
      status: string
      dueDate: string
    }>
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardContent({ userName: _userName }: { userName: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/summary")
      if (response.ok) {
        const summaryData = await response.json()
        setData(summaryData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-xl">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const hasExpenses = data && data.totals.expenses.count > 0
  const hasInvoices = data && data.totals.invoices.count > 0

  return (
    <div className="space-y-12">
      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-300">Total Expenses</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-lg text-white">💸</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {data ? formatCurrency(data.totals.expenses.amount) : "$0.00"}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              {data ? `${data.totals.expenses.count} expenses recorded` : "No expenses recorded yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total Invoices</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-lg text-white">🧾</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {data ? formatCurrency(data.totals.invoices.amount) : "$0.00"}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              {data ? `${data.totals.invoices.count} invoices created` : "No invoices created yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-purple-800 dark:text-purple-300">This Month</CardTitle>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-lg text-white">📊</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              data && data.thisMonth.netIncome >= 0 
                ? "text-purple-700 dark:text-purple-300" 
                : "text-red-700 dark:text-red-300"
            }`}>
              {data ? formatCurrency(data.thisMonth.netIncome) : "$0.00"}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">💸</span>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Your latest expense entries</CardDescription>
                </div>
              </div>
              {hasExpenses && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/expenses">View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasExpenses && data!.recent.expenses.length > 0 ? (
              <div className="space-y-3">
                {data!.recent.expenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {expense.category} • {formatDate(expense.date)}
                      </p>
                    </div>
                    <span className="font-bold text-red-600 text-sm">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">No expenses recorded yet</p>
                <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/expenses" className="flex items-center gap-2">
                    <span>✨</span> Add Your First Expense
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-white">🧾</span>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recent Invoices</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Your latest invoice entries</CardDescription>
                </div>
              </div>
              {hasInvoices && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/invoices">View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasInvoices && data!.recent.invoices.length > 0 ? (
              <div className="space-y-3">
                {data!.recent.invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{invoice.clientName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.invoiceNumber} • Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">
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
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">No invoices created yet</p>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/invoices" className="flex items-center gap-2">
                    <span>🚀</span> Create Your First Invoice
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Progress Indicator */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm text-white">🏆</span>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Setup Progress</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Complete your finance app setup</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Account Created</span>
              </div>
              <span className="text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-medium">Complete</span>
            </div>
            
            <div className={`flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border ${
              hasExpenses ? "border-green-200 dark:border-green-800" : "border-yellow-200 dark:border-yellow-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasExpenses ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900"
                }`}>
                  <span className={hasExpenses ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                    {hasExpenses ? "✓" : "⏳"}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Add First Expense</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                hasExpenses 
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
              }`}>
                {hasExpenses ? "Complete" : "Pending"}
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border ${
              hasInvoices ? "border-green-200 dark:border-green-800" : "border-yellow-200 dark:border-yellow-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasInvoices ? "bg-green-100 dark:bg-green-900" : "bg-yellow-100 dark:bg-yellow-900"
                }`}>
                  <span className={hasInvoices ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}>
                    {hasInvoices ? "✓" : "⏳"}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Create First Invoice</span>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                hasInvoices 
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
              }`}>
                {hasInvoices ? "Complete" : "Pending"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">📊</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">View Summary Report</span>
              </div>
              <Button asChild variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
                <Link href="/summary">View Summary</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}