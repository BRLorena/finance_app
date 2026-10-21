# 💰 Finance App

A modern, full-stack personal finance management application built with Next.js 15, TypeScript, and Prisma. Track expenses, manage invoices, and get powerful insights into your financial data with beautiful visualizations.

![Finance App](https://img.shields.io/badge/Next.js-15.5.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.17.1-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** - Secure authentication with NextAuth.js
- **Password Hashing** - bcrypt encryption for user passwords
- **Session Management** - JWT-based session handling
- **Protected Routes** - Automatic redirection for unauthenticated users

### 💸 Expense Management
- **Add Expenses** - Track daily spending with categorization
- **Smart Categories** - Pre-defined categories (Food, Transportation, Shopping, etc.)
- **🤖 AI-Powered Categorization** - Automatic category suggestions using Groq AI
- **📝 Natural Language Input** - "Spent $45 on groceries yesterday" auto-fills the form
- **Date Tracking** - Historical expense records
- **Search & Filter** - Find expenses by description, category, or date range
- **Real-time Updates** - Instant UI updates with optimistic rendering

### 🧾 Invoice Management
- **Create Invoices** - Professional invoice generation
- **Client Management** - Store client information and email addresses
- **Status Tracking** - Track invoice status (Pending, Paid, Overdue, Cancelled)
- **Due Date Management** - Automated overdue detection
- **Invoice Numbers** - Auto-generated unique invoice identifiers

### 📊 Financial Analytics & Summary
- **Dashboard Overview** - Real-time financial snapshot
- **🤖 AI Financial Insights** - Personalized recommendations and spending analysis
- **Summary Reports** - Comprehensive financial analytics
- **Category Breakdown** - Expense distribution by category
- **Status Analytics** - Invoice status breakdown
- **Period Filtering** - View data by month, year, or all time
- **Net Income Calculation** - Automatic profit/loss calculations
- **Recent Activity** - Latest expenses and invoices at a glance

### 🤖 AI-Powered Features (FREE via Groq)
- **Smart Expense Categorization** - AI suggests categories based on description
- **Natural Language Parsing** - Write expenses naturally, AI extracts details
- **Financial Insights** - Personalized spending analysis and recommendations
- **Trend Detection** - Identifies spending patterns and anomalies
- **Multi-language Support** - AI works in English, Spanish, Portuguese, and French
- **Zero Cost** - Powered by Groq's free tier (30 req/min, 14,400 req/day)

### 🌍 Internationalization
- **4 Languages** - English, Spanish, Portuguese, French
- **Dynamic Switching** - Change language on the fly
- **Localized Content** - UI, forms, and AI responses in your language
- **Date/Number Formatting** - Locale-aware formatting

### 🎨 User Experience
- **Modern UI** - Beautiful gradient backgrounds and glass morphism effects
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark Theme Support** - Built-in dark/light theme compatibility
- **Smooth Animations** - Polished transitions and micro-interactions
- **Toast Notifications** - Real-time feedback for user actions
- **Loading States** - Skeleton loaders and progress indicators

### 🏗️ Technical Features
- **Server-Side Rendering** - Fast initial page loads with Next.js 15
- **API Routes** - RESTful API endpoints for all operations
- **Database ORM** - Type-safe database operations with Prisma
- **Form Validation** - Zod schema validation on client and server
- **Error Handling** - Comprehensive error boundaries and fallbacks
- **TypeScript** - Full type safety across the entire application

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BRLorena/finance_app.git
   cd finance_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```bash
   # Database (PostgreSQL, e.g. a free Neon project)
   DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"   # pooled connection
   POSTGRES_URL="postgresql://.../neondb?sslmode=require"             # direct connection
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
   
   # Groq AI (Free tier - get your key from https://console.groq.com/keys)
   GROQ_API_KEY="gsk_your_api_key_here"
   GROQ_MODEL="llama-3.3-70b-versatile"  # Optional, this is the default

   # Testing (optional) - disables API rate limiting for E2E runs
   # DISABLE_RATE_LIMIT="true"
   ```
   
   **Get your free Groq API key:**
   - Visit [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up for a free account (GitHub/Google)
   - Create a new API key
   - Copy it to your `.env.local` file

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push   # create tables
   npm run db:seed      # optional: QA users test@example.com and demo@example.com
   ```

   The seed is idempotent: re-running it resets the data of the seeded users only.

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
finance_app/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── expenses/      # Expense CRUD operations
│   │   │   ├── invoices/      # Invoice CRUD operations
│   │   │   ├── register/      # User registration
│   │   │   └── summary/       # Financial analytics
│   │   ├── dashboard/         # Dashboard page
│   │   ├── expenses/          # Expense management page
│   │   ├── invoices/          # Invoice management page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── summary/           # Financial summary page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth-provider.tsx  # NextAuth provider
│   │   ├── dashboard-content.tsx
│   │   ├── expense-form.tsx
│   │   ├── expense-list.tsx
│   │   ├── invoice-form.tsx
│   │   ├── invoice-list.tsx
│   │   ├── invoice-management.tsx
│   │   ├── navigation.tsx
│   │   └── summary-chart.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts             # Database connection
│   │   ├── prisma.ts         # Prisma client
│   │   ├── utils.ts          # Helper functions
│   │   └── validations.ts    # Zod schemas
│   ├── types/                # TypeScript type definitions
│   ├── auth.ts               # NextAuth configuration
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── package.json
```

## 🛠️ Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm start`** - Start production server
- **`npm test`** - Run all tests (unit + integration)
- **`npm run lint`** - Run ESLint
- **`npm run type-check`** - Run TypeScript compiler

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests** - Component and utility function tests
- **Integration Tests** - API route and database tests
- **AI Tests** - Groq API integration tests (36 tests)
- **Test Coverage** - 90+ tests passing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- expenses.test.ts

# Run tests in watch mode
npm test -- --watch
```

## 🔧 Database Commands

- **`npx prisma generate`** - Generate Prisma client
- **`npx prisma migrate dev`** - Create and apply migration
- **`npx prisma studio`** - Open Prisma Studio (database GUI)
- **`npx prisma reset`** - Reset database and apply all migrations

## 🎯 Usage Guide

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Navigate** using the top navigation bar
3. **Add expenses** to track your spending
4. **Create invoices** for your income
5. **View summary** for comprehensive analytics

### Adding Expenses

**Traditional Method:**
1. Go to **Expenses** page
2. Click **"Add Expense"**
3. Fill in amount, description, category, and date
4. Click **"Add Expense"** to save

**AI-Powered Methods:**

*Option 1: Natural Language Quick Add*
1. Click **"Quick Add"** button
2. Type naturally: "Spent $45.50 on groceries yesterday"
3. AI auto-fills the form (amount, category, date)
4. Review and submit

*Option 2: AI Category Suggestion*
1. Enter expense description (e.g., "Pizza delivery")
2. Click **"AI Suggest"** button next to category
3. AI recommends the best category
4. Accept or choose different category

### Creating Invoices
1. Go to **Invoices** page
2. Click **"Create Invoice"**
3. Fill in client details, amount, and due date
4. Click **"Create Invoice"** to save

### Viewing Analytics
1. Go to **Summary** page
2. Use period filters (All Time, This Month, This Year)
3. Review financial breakdown by categories and status
4. Check recent activities

## 🔒 Security Features

- **Authentication** - Secure user authentication with NextAuth.js
- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - JWT tokens with secure configuration
- **Input Validation** - Server-side validation with Zod
- **SQL Injection Prevention** - Prisma ORM with prepared statements
- **CSRF Protection** - Built-in NextAuth CSRF protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Set up production database
3. Configure environment variables
4. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **NextAuth.js** - Complete open source authentication solution
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautifully designed components
- **Zod** - TypeScript-first schema validation
- **Groq** - Ultra-fast AI inference with free tier
- **next-intl** - Internationalization for Next.js

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ by [BRLorena](https://github.com/BRLorena)**
