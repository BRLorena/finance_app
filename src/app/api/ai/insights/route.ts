import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { generateFinancialInsights } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const locale = body.locale || 'en'
    
    // Calculate date ranges
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Fetch current month expenses
    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    })

    // Fetch previous month expenses
    const previousMonthExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    })

    // Fetch all expenses for overall analysis
    const allExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Fetch incomes
    const incomes = await prisma.income.findMany({
      where: {
        userId: session.user.id,
      },
    })

    // Calculate totals
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const previousMonthTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculate expenses by category
    const categoryMap: Record<string, { total: number; count: number }> = {}
    allExpenses.forEach((expense) => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = { total: 0, count: 0 }
      }
      categoryMap[expense.category].total += expense.amount
      categoryMap[expense.category].count += 1
    })

    const expensesByCategory = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
    }))

    // Calculate monthly trend (last 6 months)
    const monthlyTrend: Array<{ month: string; total: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)
      
      const monthExpenses = allExpenses.filter(
        (e) => e.date >= monthStart && e.date <= monthEnd
      )
      
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      monthlyTrend.push({ month: monthName, total })
    }

    // Generate AI insights
    const insights = await generateFinancialInsights({
      totalExpenses,
      totalIncome,
      expensesByCategory,
      monthlyTrend,
      previousMonthTotal,
      currentMonthTotal,
    }, locale)

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
