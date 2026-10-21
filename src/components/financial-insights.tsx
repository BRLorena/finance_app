"use client"

import { useState } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type FinancialInsights = {
  summary: string
  trends: string[]
  recommendations: string[]
  alerts: string[]
}

export function FinancialInsights() {
  const t = useTranslations('ai')
  const locale = useLocale()
  const [insights, setInsights] = useState<FinancialInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch insights')
      }
      
      const data = await response.json()
      setInsights(data)
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
    // Fetch insights when expanding for the first time
    if (!isExpanded && !insights && !loading) {
      fetchInsights()
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl overflow-hidden">
      <CardHeader className="relative">
        <div 
          className="cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-4 -m-4"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('financialInsights')}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {isExpanded ? t('aiAnalysis') : t('clickToView')}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <>
                  {insights && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        fetchInsights()
                      }}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('generating')}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('refresh')}
                        </>
                      )}
                    </Button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(false)
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label="Collapse"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </>
              ) : (
                <svg 
                  className="w-6 h-6 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-2">{t('ollamaRunning')}</p>
              <Button
                onClick={fetchInsights}
                className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm"
              >
                {t('retry')}
              </Button>
            </div>
          ) : loading && !insights ? (
            <div className="space-y-4">
              <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-32 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-32 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-white leading-relaxed">{insights.summary}</p>
              </div>

              {/* Alerts */}
              {insights.alerts && insights.alerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                    <span>⚠️</span>
                    {t('alerts')}
                  </h3>
                  <div className="space-y-2">
                    {insights.alerts.map((alertItem, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                      >
                        <p className="text-yellow-200 text-sm">{alertItem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              {insights.trends && insights.trends.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <span>📈</span>
                    {t('spendingTrends')}
                  </h3>
                  <div className="space-y-2">
                    {insights.trends.map((trend, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3"
                      >
                        <span className="text-blue-400 mt-0.5">•</span>
                        <p className="text-gray-200 text-sm flex-1">{trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <span>💡</span>
                    {t('recommendations')}
                  </h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3"
                      >
                        <span className="text-green-400 mt-0.5">✓</span>
                        <p className="text-gray-200 text-sm flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  {t('disclaimer')}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
              <p className="text-gray-400 text-sm">{t('clickToGenerate')}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
