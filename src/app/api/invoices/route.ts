import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { invoiceFormSchema } from "@/lib/validations"
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = rateLimit(session.user.id, 'invoices', RATE_LIMITS.standard)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult, RATE_LIMITS.standard)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientEmail: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    // Add short cache to reduce server load
    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = invoiceFormSchema.parse(body)

    // Generate invoice number if not provided
    const invoiceNumber = validatedData.invoiceNumber || 
      `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Transform form data to proper types
    const invoiceData = {
      invoiceNumber,
      clientName: validatedData.clientName,
      clientEmail: validatedData.clientEmail || null,
      amount: parseFloat(validatedData.amount),
      description: validatedData.description,
      dueDate: new Date(validatedData.dueDate),
      issueDate: new Date(validatedData.issueDate),
      status: validatedData.status,
      notes: validatedData.notes || null,
      userId: session.user.id,
    }

    const invoice = await prisma.invoice.create({
      data: invoiceData,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}