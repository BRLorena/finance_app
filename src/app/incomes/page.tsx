"use client"

import { useState } from "react"
import { IncomeList } from "@/components/income-list"

export default function IncomePage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl text-white font-bold">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                Income Management
              </h1>
              <p className="text-gray-300">
                Track your salary, freelance work, and other income sources
              </p>
            </div>
          </div>
        </div>

        {/* Income List Component */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl p-8 rounded-3xl">
          <IncomeList showForm={showForm} onFormToggle={setShowForm} />
        </div>
      </div>
    </div>
  )
}