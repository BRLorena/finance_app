"use client"

import { useState } from "react"
import { ExpenseList } from "@/components/expense-list"
import { useTranslations } from 'next-intl'
// Card components removed as they are not used in this component

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)
  const t = useTranslations('expenses')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-green-400 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">💰 {t('smartTracking')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent mb-6 tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <ExpenseList 
          showForm={showForm} 
          onFormToggle={setShowForm}
        />
      </div>
    </div>
  )
}