import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parseExpenseFromText } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { text, locale = 'en' } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const parsed = await parseExpenseFromText(text, locale)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Error parsing expense:', error)
    return NextResponse.json(
      { error: 'Failed to parse expense' },
      { status: 500 }
    )
  }
}
