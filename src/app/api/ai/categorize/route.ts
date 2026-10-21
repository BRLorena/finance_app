import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { categorizeExpense } from '@/lib/groq'
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - AI endpoint
    const rateLimitResult = rateLimit(session.user.id, 'ai-categorize', RATE_LIMITS.ai)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many AI requests. Please wait before trying again.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult, RATE_LIMITS.ai)
        }
      )
    }

    const body = await request.json()
    const { description, locale = 'en' } = body

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const category = await categorizeExpense(description, locale)

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error in AI categorization:', error)
    return NextResponse.json(
      { error: 'Failed to categorize expense' },
      { status: 500 }
    )
  }
}
