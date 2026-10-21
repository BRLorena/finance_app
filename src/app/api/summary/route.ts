import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting - heavy endpoint
    const rateLimitResult = rateLimit(session.user.id, 'summary', RATE_LIMITS.heavy)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult, RATE_LIMITS.heavy)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all" // all, month, year
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const month = searchParams.get("month") || (new Date().getMonth() + 1).toString()

    // Calculate date range based on period
    let startDate: Date
    let endDate: Date = new Date()

    switch (period) {
      case "month":
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
        break
      case "year":
        startDate = new Date(parseInt(year), 0, 1)
        endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
        break
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    const whereCondition: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (period !== "all") {
      whereCondition.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Get expense totals and breakdowns
    const [
      totalExpenses,
      expensesByCategory,
      monthlyExpenses,
      recentExpenses,
      totalIncomes,
      incomesByCategory,
      monthlyIncomes,
      recentIncomes,
      totalInvoices,
      invoicesByStatus,
      monthlyInvoices,
      recentInvoices,
    ] = await Promise.all([
      // Total expenses
      prisma.expense.aggregate({
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
      }),

      // Expenses by category
      prisma.expense.groupBy({
        by: ["category"],
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
      }),

      // Monthly expenses for the last 12 months (using Prisma ORM instead of raw SQL)
      prisma.expense.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
          },
        },
        select: {
          amount: true,
          date: true,
        },
      }).then((expenses: { amount: number; date: Date }[]) => {
        const monthlyData: Record<string, { total: number; count: number }> = {}
        expenses.forEach((expense: { amount: number; date: Date }) => {
          const month = expense.date.toISOString().slice(0, 7) // YYYY-MM format
          if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 }
          }
          monthlyData[month].total += expense.amount
          monthlyData[month].count += 1
        })
        return Object.entries(monthlyData)
          .map(([month, data]) => ({ month, total: data.total, count: data.count }))
          .sort((a, b) => b.month.localeCompare(a.month))
      }),

      // Recent expenses
      prisma.expense.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Total incomes
      prisma.income.aggregate({
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
      }),

      // Incomes by category
      prisma.income.groupBy({
        by: ["category"],
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: "desc" } },
      }),

      // Monthly incomes for the last 12 months (using Prisma ORM instead of raw SQL)
      prisma.income.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
          },
        },
        select: {
          amount: true,
          date: true,
        },
      }).then((incomes: { amount: number; date: Date }[]) => {
        const monthlyData: Record<string, { total: number; count: number }> = {}
        incomes.forEach((income: { amount: number; date: Date }) => {
          const month = income.date.toISOString().slice(0, 7) // YYYY-MM format
          if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 }
          }
          monthlyData[month].total += income.amount
          monthlyData[month].count += 1
        })
        return Object.entries(monthlyData)
          .map(([month, data]) => ({ month, total: data.total, count: data.count }))
          .sort((a, b) => b.month.localeCompare(a.month))
      }),

      // Recent incomes
      prisma.income.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Total invoices
      prisma.invoice.aggregate({
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
      }),

      // Invoices by status
      prisma.invoice.groupBy({
        by: ["status"],
        where: whereCondition,
        _sum: { amount: true },
        _count: true,
      }),

      // Monthly invoices for the last 12 months (using Prisma ORM instead of raw SQL)
      prisma.invoice.findMany({
        where: {
          userId: session.user.id,
          issueDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
          },
        },
        select: {
          amount: true,
          issueDate: true,
        },
      }).then((invoices: { amount: number; issueDate: Date }[]) => {
        const monthlyData: Record<string, { total: number; count: number }> = {}
        invoices.forEach((invoice: { amount: number; issueDate: Date }) => {
          const month = invoice.issueDate.toISOString().slice(0, 7) // YYYY-MM format
          if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 }
          }
          monthlyData[month].total += invoice.amount
          monthlyData[month].count += 1
        })
        return Object.entries(monthlyData)
          .map(([month, data]) => ({ month, total: data.total, count: data.count }))
          .sort((a, b) => b.month.localeCompare(a.month))
      }),

      // Recent invoices
      prisma.invoice.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    // Calculate net income (incomes + invoices - expenses)
    const totalInvoiceAmount = totalInvoices._sum.amount || 0
    const totalIncomeAmount = totalIncomes._sum.amount || 0
    const totalExpenseAmount = totalExpenses._sum.amount || 0
    const netIncome = totalIncomeAmount + totalInvoiceAmount - totalExpenseAmount

    // Calculate this month's data
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
    const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

    // For filtered periods, calculate period-specific data
    let periodData = null
    let periodName = ""
    
    if (period === "month" || period === "year") {
      periodData = await Promise.all([
        prisma.expense.aggregate({
          where: whereCondition,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.income.aggregate({
          where: whereCondition,
          _sum: { amount: true },
          _count: true,
        }),
        prisma.invoice.aggregate({
          where: whereCondition,
          _sum: { amount: true },
          _count: true,
        }),
      ])
      
      if (period === "month") {
        periodName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      } else {
        periodName = `Year ${year}`
      }
    }

    const [thisMonthExpenses, thisMonthIncomes, thisMonthInvoices] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.income.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: thisMonthStart,
            lte: thisMonthEnd,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    // Format response
    const summary = {
      totals: {
        expenses: {
          amount: totalExpenseAmount,
          count: totalExpenses._count,
        },
        incomes: {
          amount: totalIncomeAmount,
          count: totalIncomes._count,
        },
        invoices: {
          amount: totalInvoiceAmount,
          count: totalInvoices._count,
        },
        netIncome,
      },
      thisMonth: {
        expenses: {
          amount: thisMonthExpenses._sum.amount || 0,
          count: thisMonthExpenses._count,
        },
        incomes: {
          amount: thisMonthIncomes._sum.amount || 0,
          count: thisMonthIncomes._count,
        },
        invoices: {
          amount: thisMonthInvoices._sum.amount || 0,
          count: thisMonthInvoices._count,
        },
        netIncome: (thisMonthIncomes._sum.amount || 0) + (thisMonthInvoices._sum.amount || 0) - (thisMonthExpenses._sum.amount || 0),
        monthName: currentMonthName,
      },
      selectedPeriod: periodData ? {
        expenses: {
          amount: periodData[0]._sum.amount || 0,
          count: periodData[0]._count,
        },
        incomes: {
          amount: periodData[1]._sum.amount || 0,
          count: periodData[1]._count,
        },
        invoices: {
          amount: periodData[2]._sum.amount || 0,
          count: periodData[2]._count,
        },
        netIncome: (periodData[1]._sum.amount || 0) + (periodData[2]._sum.amount || 0) - (periodData[0]._sum.amount || 0),
        periodName,
      } : undefined,
      breakdown: {
        expensesByCategory: expensesByCategory.map((item: { category: string; _sum: { amount: number | null }; _count: number }) => ({
          category: item.category,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
        incomesByCategory: incomesByCategory.map((item: { category: string; _sum: { amount: number | null }; _count: number }) => ({
          category: item.category,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
        invoicesByStatus: invoicesByStatus.map((item: { status: string; _sum: { amount: number | null }; _count: number }) => ({
          status: item.status,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
      },
      trends: {
        monthlyExpenses: monthlyExpenses as Array<{ month: string; total: number; count: number }>,
        monthlyIncomes: monthlyIncomes as Array<{ month: string; total: number; count: number }>,
        monthlyInvoices: monthlyInvoices as Array<{ month: string; total: number; count: number }>,
      },
      recent: {
        expenses: recentExpenses,
        incomes: recentIncomes,
        invoices: recentInvoices,
      },
      meta: {
        period,
        startDate: period !== "all" ? startDate.toISOString() : null,
        endDate: period !== "all" ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
      },
    }

    // Add caching to reduce server CPU usage
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack trace') : undefined
      },
      { status: 500 }
    )
  }
}