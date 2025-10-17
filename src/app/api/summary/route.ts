import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const whereCondition: any = {
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

      // Monthly expenses for the last 12 months
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM expenses 
        WHERE userId = ${session.user.id}
          AND date >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
      `,

      // Recent expenses
      prisma.expense.findMany({
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

      // Monthly invoices for the last 12 months
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', issueDate) as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM invoices 
        WHERE userId = ${session.user.id}
          AND issueDate >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', issueDate)
        ORDER BY month DESC
      `,

      // Recent invoices
      prisma.invoice.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    // Calculate net income (invoices - expenses)
    const totalInvoiceAmount = totalInvoices._sum.amount || 0
    const totalExpenseAmount = totalExpenses._sum.amount || 0
    const netIncome = totalInvoiceAmount - totalExpenseAmount

    // Calculate this month's data
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const thisMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)

    const [thisMonthExpenses, thisMonthInvoices] = await Promise.all([
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
        invoices: {
          amount: thisMonthInvoices._sum.amount || 0,
          count: thisMonthInvoices._count,
        },
        netIncome: (thisMonthInvoices._sum.amount || 0) - (thisMonthExpenses._sum.amount || 0),
      },
      breakdown: {
        expensesByCategory: expensesByCategory.map((item: any) => ({
          category: item.category,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
        invoicesByStatus: invoicesByStatus.map((item: any) => ({
          status: item.status,
          amount: item._sum.amount || 0,
          count: item._count,
        })),
      },
      trends: {
        monthlyExpenses: monthlyExpenses as Array<{ month: string; total: number; count: number }>,
        monthlyInvoices: monthlyInvoices as Array<{ month: string; total: number; count: number }>,
      },
      recent: {
        expenses: recentExpenses,
        invoices: recentInvoices,
      },
      meta: {
        period,
        startDate: period !== "all" ? startDate.toISOString() : null,
        endDate: period !== "all" ? endDate.toISOString() : null,
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}