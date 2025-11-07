import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SummaryChart } from "@/components/summary-chart"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl p-8 rounded-3xl">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl text-white font-bold">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-300">
                Here&apos;s your financial overview for today
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button variant="outline" type="submit" className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white px-6 py-3 rounded-xl">
              <span className="mr-2">👋</span> Sign Out
            </Button>
          </form>
        </div>

        {/* Dashboard Content */}
        <SummaryChart />
      </div>
    </div>
  )
}