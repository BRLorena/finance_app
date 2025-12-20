"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navigation() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const links = [
    { href: "/dashboard", label: t('dashboard'), icon: "🏠" },
    { href: "/expenses", label: t('expenses'), icon: "💸" },
    { href: "/incomes", label: t('incomes'), icon: "💰" },
    { href: "/invoices", label: t('invoices'), icon: "🧾" },
    { href: "/summary", label: t('summary'), icon: "📊" },
  ]

  // Don't show navigation on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-sm text-white font-bold">💰</span>
              </div>
              <span className="text-white font-bold text-lg tracking-wide">FinanceApp</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    pathname === link.href
                      ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/30"
                      : "text-gray-200 hover:text-white hover:bg-gray-700/60"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700/60 hover:text-white">
                <span className="sr-only">Open menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  pathname === link.href
                    ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/30"
                    : "text-gray-200 hover:text-white hover:bg-gray-700/60"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}