import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { categorizeExpense } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
