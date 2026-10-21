/**
 * Seeds known QA users with deterministic data.
 * Re-running resets the data of these users only; other users are untouched.
 *
 * Usage: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Must match the E2E repo (tests/auth.setup.ts and src/test-data/users.ts)
const USERS = [
  { name: 'John Doe', email: 'test@example.com', password: 'testpassword123', withData: false },
  { name: 'Demo User', email: 'demo@example.com', password: 'demo123', withData: true },
]

// Dates relative to today so "this month" views always have data
function daysAgo(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function daysFromNow(days) {
  return daysAgo(-days)
}

const EXPENSES = [
  { amount: 45.9, description: 'Weekly groceries', category: 'foodDining', date: daysAgo(2) },
  { amount: 12.5, description: 'Lunch with team', category: 'foodDining', date: daysAgo(5) },
  { amount: 60, description: 'Monthly metro pass', category: 'transportation', date: daysAgo(8) },
  { amount: 89.99, description: 'Electricity bill', category: 'billsUtilities', date: daysAgo(10) },
  { amount: 15.99, description: 'Streaming subscription', category: 'entertainment', date: daysAgo(12) },
  { amount: 120, description: 'Running shoes', category: 'shopping', date: daysAgo(20) },
  { amount: 35, description: 'Pharmacy', category: 'healthcare', date: daysAgo(35) },
  { amount: 250, description: 'Weekend trip train tickets', category: 'travel', date: daysAgo(40) },
]

const INCOMES = [
  { amount: 3200, description: 'Monthly salary', category: 'salary', date: daysAgo(3), recurring: true, frequency: 'monthly' },
  { amount: 650, description: 'Freelance website project', category: 'freelance', date: daysAgo(15), recurring: false },
  { amount: 3200, description: 'Monthly salary', category: 'salary', date: daysAgo(33), recurring: true, frequency: 'monthly' },
  { amount: 42.3, description: 'ETF dividends', category: 'investment', date: daysAgo(25), recurring: false },
]

const INVOICES = [
  { clientName: 'Acme Corp', clientEmail: 'billing@acme.test', amount: 1500, description: 'Website redesign', issueDate: daysAgo(30), dueDate: daysAgo(5), status: 'OVERDUE' },
  { clientName: 'Globex Ltd', clientEmail: 'ap@globex.test', amount: 800, description: 'QA consulting - sprint 12', issueDate: daysAgo(20), dueDate: daysFromNow(10), status: 'PENDING' },
  { clientName: 'Initech', clientEmail: 'finance@initech.test', amount: 450, description: 'Test automation workshop', issueDate: daysAgo(45), dueDate: daysAgo(15), status: 'PAID' },
]

async function seedUser({ name, email, password, withData }) {
  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashedPassword },
    create: { name, email, password: hashedPassword },
  })

  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { userId: user.id } }),
    prisma.income.deleteMany({ where: { userId: user.id } }),
    prisma.invoice.deleteMany({ where: { userId: user.id } }),
  ])

  if (withData) {
    await prisma.expense.createMany({ data: EXPENSES.map((e) => ({ ...e, userId: user.id })) })
    await prisma.income.createMany({ data: INCOMES.map((i) => ({ ...i, userId: user.id })) })
    await prisma.invoice.createMany({ data: INVOICES.map((i) => ({ ...i, userId: user.id })) })
  }

  console.log(`Seeded ${email}${withData ? ' with sample data' : ' (empty)'}`)
}

async function main() {
  for (const user of USERS) {
    await seedUser(user)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
