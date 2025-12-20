# AI Setup with Groq (Free Tier)

This app uses Groq API for AI-powered features - a **free, fast, and reliable** solution for expense categorization, financial insights, and natural language parsing.

## 🚀 Setup Instructions

### 1. Get Your Free Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account (no credit card required)
3. Create a new API key
4. Copy the API key (starts with `gsk_...`)

### 2. Configure Environment Variables

Add to your `.env.local` file:
```bash
# Groq AI Configuration
GROQ_API_KEY="gsk_your_api_key_here"

# Optional: Change the model (default: llama-3.3-70b-versatile)
# GROQ_MODEL="llama-3.3-70b-versatile"
```

### 3. Deploy to Vercel

Set the environment variable in your Vercel project settings:
```bash
GROQ_API_KEY="gsk_your_api_key_here"
```

## 💰 Cost & Limits

- **100% FREE** for the free tier
- **Generous rate limits**: 30 requests/minute, 14,400 requests/day
- **Super fast inference**: Powered by LPUs (Language Processing Units)
- **No credit card required**

## 🤖 Available Models

The app uses `llama-3.3-70b-versatile` by default, which provides excellent results for:
- Expense categorization
- Financial insights generation
- Natural language expense parsing

Other available models you can set via `GROQ_MODEL`:
- `llama-3.3-70b-versatile` (recommended)
- `llama-3.1-70b-versatile`
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

## ✨ Features Powered by Groq AI

1. **Smart Expense Categorization**: Automatically categorize expenses from descriptions
2. **Financial Insights**: Get personalized spending analysis and recommendations
3. **Natural Language Input**: Parse expenses from text like "Spent $45 on groceries yesterday"

## 🧪 Testing

After setup, test the AI features by:

1. **Auto-categorization**: 
   - Add a new expense
   - Enter a description like "Lunch at Chipotle"
   - The category should be automatically suggested

2. **Financial Insights**:
   - Go to the Summary page
   - View AI-generated insights about your spending patterns
   - Get personalized recommendations

3. **Natural Language Parsing**:
   - Try entering: "Spent $25 on coffee at Starbucks yesterday"
   - The AI will extract amount, category, and date automatically

## 🔧 Troubleshooting

**API Key Issues:**
- Make sure your API key starts with `gsk_`
- Verify the key is set in `.env.local` for local dev
- Check Vercel environment variables for production

**Rate Limits:**
- Free tier: 30 requests/minute
- If you hit limits, wait 60 seconds or upgrade to paid tier

**Model Errors:**
- Ensure you're using a valid model name
- Default `llama-3.3-70b-versatile` is recommended

## 📚 Resources

- [Groq Documentation](https://console.groq.com/docs)
- [API Reference](https://console.groq.com/docs/api-reference)
- [Available Models](https://console.groq.com/docs/models)
