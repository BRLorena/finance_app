import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { incomeFormSchema } from "@/lib/validations"

// GET /api/incomes/[id] - Get specific income
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const income = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error) {
    console.error("Error fetching income:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/incomes/[id] - Update income
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedFields = incomeFormSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.issues },
        { status: 400 }
      )
    }

    const { amount, description, category, date, recurring, frequency } = validatedFields.data

    // Check if income exists and belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    const income = await prisma.income.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
        description,
        category,
        date: new Date(date),
        recurring,
        frequency: frequency || null,
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error("Error updating income:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/incomes/[id] - Delete income
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if income exists and belongs to user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingIncome) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 })
    }

    await prisma.income.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Income deleted successfully" })
  } catch (error) {
    console.error("Error deleting income:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}