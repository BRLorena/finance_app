// Jest setup file for DOM and testing library matchers
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for Next.js Request/Response (needed for API route tests)
global.TextEncoder = TextEncoder as any
global.TextDecoder = TextDecoder as any

// Mock Headers for API routes
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private map = new Map()
    set(key: string, value: string) {
      this.map.set(key.toLowerCase(), value)
    }
    get(key: string) {
      return this.map.get(key.toLowerCase())
    }
    has(key: string) {
      return this.map.has(key.toLowerCase())
    }
    forEach(callback: (value: string, key: string) => void) {
      this.map.forEach(callback)
    }
  } as any
}

// Mock Request for API routes - minimal implementation
if (typeof Request === 'undefined') {
  global.Request = class Request {
    headers = new Headers()
    url: string
    method: string
    constructor(input: string | URL, init: any = {}) {
      this.url = typeof input === 'string' ? input : input.toString()
      this.method = init.method || 'GET'
      if (init.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string)
        })
      }
    }
    async json() {
      return {}
    }
    async text() {
      return ''
    }
    clone() {
      return this
    }
  } as any
}

// Mock Response for API routes - only if undefined or doesn't have json static method
if (typeof Response === 'undefined' || !Response.json) {
  const OriginalResponse = typeof Response !== 'undefined' ? Response : class {}
  
  global.Response = class Response extends (OriginalResponse as any) {
    headers = new Headers()
    constructor(public body: any, public init: any = {}) {
      super()
      this.status = init?.status || 200
      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string)
        })
      }
    }
    status: number
    
    static json(data: any, init?: any) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
    }
  } as any
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (num: number) => num.toString(),
  }),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Note: Prisma Client is mocked individually in tests that need it

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'sqlite:///:memory:'

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// MSW is set up individually in integration tests that need it