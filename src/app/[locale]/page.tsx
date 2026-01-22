import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Static page - no server-side processing needed per request
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-8 mb-20">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">✨ Modern Financial Management</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              Your Money,
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Simplified
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of personal finance. Track expenses, manage invoices, 
            and unlock powerful insights with our beautiful, intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transform">
              <Link href="/register" className="flex items-center gap-2">
                🚀 Start Free Today
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm py-4 px-10 rounded-xl transition-all duration-300 hover:border-white/40 hover:scale-105 transform bg-white/5">
              <Link href="/login" className="flex items-center gap-2 text-white">
                ✨ Sign In
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mt-32">
          <Card className="group backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20 shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 via-green-400/5 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 group-hover:shadow-2xl group-hover:shadow-green-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-3xl">�</span>
              </div>
              <CardTitle className="text-white text-2xl font-bold mb-3">Expense Tracking</CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed">
                Effortlessly monitor and categorize your daily spending with our intelligent expense tracking system. Get real-time insights and never lose track of your money.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400 mb-4">
                <li className="flex items-center gap-2">✓ Smart categorization</li>
                <li className="flex items-center gap-2">✓ Real-time updates</li>
                <li className="flex items-center gap-2">✓ Advanced filtering</li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold">
                <Link href="/expenses">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/20 shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-400/5 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-3xl">📄</span>
              </div>
              <CardTitle className="text-white text-2xl font-bold mb-3">Invoice Management</CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed">
                Create stunning, professional invoices in seconds. Track payment status, send reminders, and manage your client billing with ease.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400 mb-4">
                <li className="flex items-center gap-2">✓ Professional templates</li>
                <li className="flex items-center gap-2">✓ Payment tracking</li>
                <li className="flex items-center gap-2">✓ Client management</li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold">
                <Link href="/invoices">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-3 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-purple-400/5 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-500/70 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-3xl">�</span>
              </div>
              <CardTitle className="text-white text-2xl font-bold mb-3">Financial Insights</CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed">
                Unlock powerful analytics and visualizations. Understand your spending patterns, identify trends, and make data-driven financial decisions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400 mb-4">
                <li className="flex items-center gap-2">✓ Visual dashboards</li>
                <li className="flex items-center gap-2">✓ Spending trends</li>
                <li className="flex items-center gap-2">✓ Custom reports</li>
              </ul>
              <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border border-white/20 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Ready to Transform Your Finances?
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users who have already taken control of their financial future. 
                Start your journey today—completely free.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transform">
                <Link href="/register" className="flex items-center gap-2">
                  🎉 Get Started Free
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
