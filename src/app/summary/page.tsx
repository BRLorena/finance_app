import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SummaryChart } from "@/components/summary-chart"

export default async function SummaryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl p-8 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl text-white font-bold">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Financial Summary
              </h1>
              <p className="text-gray-300">
                Comprehensive overview of your financial data
              </p>
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 shadow-xl p-8 rounded-3xl">
          <SummaryChart />
        </div>
      </div>
    </div>
  )
}