import type { Metadata } from "next"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthProvider } from "@/components/auth-provider"
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finance App",
  description: "Personal finance management application",
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: 'white',
                borderRadius: '12px',
              },
            }}
          />
        </NextIntlClientProvider>
        {/* Vercel Analytics - monitor usage to stay within limits */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
