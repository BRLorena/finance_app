/**
 * AI client using Groq API (free tier available)
 * Get your API key from: https://console.groq.com/keys
 */

import Groq from 'groq-sdk'

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

// Lazy initialization of Groq client
let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set. Please add it to your .env.local file.')
    }
    
    groqClient = new Groq({
      apiKey: apiKey,
    })
  }
  
  return groqClient
}

/**
 * Generate text using Groq API
 */
async function generateWithGroq(
  prompt: string,
  temperature: number = 0.3
): Promise<string> {
  try {
    const groq = getGroqClient()

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature,
      max_tokens: 1024,
    })

    const response = chatCompletion.choices[0]?.message?.content || ''
    return response.trim()
  } catch (error) {
    console.error('Error calling Groq API:', error)
    throw new Error('Failed to generate response from Groq')
  }
}

/**
 * Generate text using Groq
 */
export async function generateAI(
  prompt: string,
  temperature: number = 0.3
): Promise<string> {
  return generateWithGroq(prompt, temperature)
}

/**
 * Categorize an expense description using AI
 */
export async function categorizeExpense(description: string, locale: string = 'en'): Promise<string> {
  const validCategoryKeys = [
    'foodDining',
    'transportation',
    'shopping',
    'entertainment',
    'billsUtilities',
    'healthcare',
    'travel',
    'education',
    'business',
    'other',
  ]

  const categoryDescriptions: Record<string, string> = {
    en: 'Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Other',
    pt: 'Alimentação e Refeições, Transporte, Compras, Entretenimento, Contas e Utilidades, Saúde, Viagem, Educação, Negócios, Outro',
    es: 'Comida y Restaurantes, Transporte, Compras, Entretenimiento, Facturas y Servicios, Salud, Viaje, Educación, Negocios, Otro',
    fr: 'Nourriture et Restaurants, Transport, Achats, Divertissement, Factures et Services, Santé, Voyage, Éducation, Affaires, Autre'
  }

  const languageInstructions: Record<string, string> = {
    en: 'You are a financial categorization assistant.',
    pt: 'Você é um assistente de categorização financeira.',
    es: 'Eres un asistente de categorización financiera.',
    fr: 'Vous êtes un assistant de catégorisation financière.'
  }

  const categories = categoryDescriptions[locale] || categoryDescriptions.en
  const instruction = languageInstructions[locale] || languageInstructions.en

  const prompt = `${instruction} Categorize the following expense into exactly ONE of these categories:
${categories}

Expense description: "${description}"

Rules:
- Respond with ONLY the category number (1-10), nothing else
- Choose the most appropriate category
- If unsure, use 10 (Other/Outro/Otro/Autre)

Category number:`

  const response = await generateAI(prompt, 0.3)
  
  // Extract number from response
  const numberMatch = response.match(/\d+/)
  const categoryIndex = numberMatch ? parseInt(numberMatch[0]) - 1 : 9
  
  // Return the category key
  return validCategoryKeys[categoryIndex] || 'other'
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!process.env.GROQ_API_KEY
}

/**
 * Get the current AI provider name
 */
export function getAIProvider(): string {
  return `Groq (${GROQ_MODEL})`
}

/**
 * Generate financial insights based on expense data
 */
export async function generateFinancialInsights(data: {
  totalExpenses: number
  totalIncome: number
  expensesByCategory: Array<{ category: string; total: number; count: number }>
  monthlyTrend: Array<{ month: string; total: number }>
  previousMonthTotal?: number
  currentMonthTotal?: number
}, locale: string = 'en'): Promise<{
  summary: string
  trends: string[]
  recommendations: string[]
  alerts: string[]
}> {
  const {
    totalExpenses,
    totalIncome,
    expensesByCategory,
    monthlyTrend,
    previousMonthTotal = 0,
    currentMonthTotal = 0,
  } = data

  // Calculate key metrics
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)
    : '0'
  
  const monthlyChange = previousMonthTotal > 0
    ? (((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1)
    : '0'

  const topCategories = expensesByCategory
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(c => `${c.category}: $${c.total.toFixed(2)}`)
    .join(', ')

  const languageInstructions: Record<string, string> = {
    en: 'You are a professional financial advisor. Generate insights in English.',
    pt: 'Você é um consultor financeiro profissional. Gere insights em Português.',
    es: 'Eres un asesor financiero profesional. Genera información en Español.',
    fr: 'Vous êtes un conseiller financier professionnel. Générez des informations en Français.'
  }

  const instruction = languageInstructions[locale] || languageInstructions.en

  const prompt = `${instruction} Analyze spending patterns and generate personalized financial insights.

Financial Data:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Current Month Expenses: $${currentMonthTotal.toFixed(2)}
- Previous Month Expenses: $${previousMonthTotal.toFixed(2)}
- Month-over-Month Change: ${monthlyChange}%
- Top Spending Categories: ${topCategories}

Category Breakdown:
${expensesByCategory.map(c => `- ${c.category}: $${c.total.toFixed(2)} (${c.count} transactions)`).join('\n')}

Monthly Trend (last 6 months):
${monthlyTrend.slice(-6).map(m => `- ${m.month}: $${m.total.toFixed(2)}`).join('\n')}

Generate insights in JSON format with:
1. summary: A brief 2-3 sentence overview of their financial health
2. trends: Array of 2-3 observed spending trends or patterns
3. recommendations: Array of 3-4 actionable money-saving tips specific to their spending
4. alerts: Array of 1-2 warnings about unusual spending or areas of concern (empty array if none)

Rules:
- Be specific and use actual numbers from the data
- Keep insights concise and actionable
- Be encouraging but realistic
- Focus on practical advice
- Return ONLY valid JSON, nothing else

Response format (JSON only):
{
  "summary": "Brief overview...",
  "trends": ["Trend 1...", "Trend 2..."],
  "recommendations": ["Tip 1...", "Tip 2...", "Tip 3..."],
  "alerts": ["Alert 1..." or empty array]
}`

  try {
    const response = await generateAI(prompt, 0.4)
    
    // Clean up the response
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }
    
    const parsed = JSON.parse(cleanResponse)
    
    return {
      summary: parsed.summary || 'No summary available',
      trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
    }
  } catch (error) {
    console.error('Error generating financial insights:', error)
    // Fallback insights
    return {
      summary: `You've spent $${totalExpenses.toFixed(2)} with a savings rate of ${savingsRate}%. ${
        parseFloat(monthlyChange) > 0 
          ? `Your spending increased by ${monthlyChange}% this month.`
          : `Your spending decreased by ${Math.abs(parseFloat(monthlyChange))}% this month.`
      }`,
      trends: [
        `Top spending category is ${expensesByCategory[0]?.category || 'Unknown'}`,
        parseFloat(monthlyChange) > 20 
          ? 'Significant increase in spending this month'
          : 'Spending is relatively stable'
      ],
      recommendations: [
        'Review your top spending categories for optimization opportunities',
        'Set monthly budgets for each category',
        'Track expenses regularly to stay on target'
      ],
      alerts: parseFloat(monthlyChange) > 30 
        ? ['Spending increased significantly this month - review for unusual expenses']
        : []
    }
  }
}

/**
 * Parse natural language expense input into structured data
 */
export async function parseExpenseFromText(text: string, locale: string = 'en'): Promise<{
  amount: number | null
  description: string
  category: string | null
  date: string | null
}> {
  const validCategoryKeys = [
    'foodDining',
    'transportation',
    'shopping',
    'entertainment',
    'billsUtilities',
    'healthcare',
    'travel',
    'education',
    'business',
    'other',
  ]

  const languageInstructions: Record<string, string> = {
    en: 'You are a financial assistant that extracts expense information from natural language in English.',
    pt: 'Você é um assistente financeiro que extrai informações de despesas de linguagem natural em Português.',
    es: 'Eres un asistente financiero que extrae información de gastos del lenguaje natural en Español.',
    fr: 'Vous êtes un assistant financier qui extrait des informations de dépenses du langage naturel en Français.'
  }

  const instruction = languageInstructions[locale] || languageInstructions.en

  const prompt = `${instruction}

Parse the following text into structured expense data:
"${text}"

Extract:
1. Amount (numeric value only, no currency symbols)
2. Description (brief description of the expense)
3. Category (choose number 1-10: 1=Food/Comida/Alimentação, 2=Transport/Transporte, 3=Shopping/Compras, 4=Entertainment/Entretenimento, 5=Bills/Contas/Facturas, 6=Healthcare/Saúde/Salud/Santé, 7=Travel/Viagem/Viaje/Voyage, 8=Education/Educação/Educación/Éducation, 9=Business/Negócios/Negocios/Affaires, 10=Other/Outro/Otro/Autre)
4. Date (ISO format YYYY-MM-DD, use today if not specified: ${new Date().toISOString().split('T')[0]})

Rules:
- If amount is not found, return null
- If category is not mentioned, suggest the most appropriate category number
- If date is not mentioned or is "today", use today's date
- Parse relative dates like "yesterday" or "last week"
- Return ONLY valid JSON, nothing else

Response format (JSON only):
{
  "amount": <number or null>,
  "description": "<string>",
  "categoryNumber": <1-10>,
  "date": "<YYYY-MM-DD>"
}`

  try {
    const response = await generateAI(prompt, 0.2)
    
    // Clean up the response - remove markdown code blocks if present
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }
    
    const parsed = JSON.parse(cleanResponse)
    
    // Map category number to key
    const categoryIndex = (parsed.categoryNumber || 10) - 1
    const category = validCategoryKeys[categoryIndex] || 'other'
    
    return {
      amount: parsed.amount ? parseFloat(parsed.amount) : null,
      description: parsed.description || text,
      category: category,
      date: parsed.date || new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('Error parsing expense from text:', error)
    // Fallback: return basic parsing
    const amountMatch = text.match(/\$?(\d+\.?\d*)/)
    return {
      amount: amountMatch ? parseFloat(amountMatch[1]) : null,
      description: text,
      category: null,
      date: new Date().toISOString().split('T')[0],
    }
  }
}
