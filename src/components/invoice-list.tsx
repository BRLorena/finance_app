"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { toast } from "sonner"

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail?: string
  amount: number
  description: string
  dueDate: string
  issueDate: string
  status: string
  notes?: string
  createdAt: string
}

interface InvoiceListProps {
  onEdit?: (invoice: Invoice) => void
  onSuccess?: () => void
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
}

const statusEmojis = {
  PENDING: "⏳",
  PAID: "✅",
  OVERDUE: "⚠️",
  CANCELLED: "❌",
}

export function InvoiceList({ onEdit, onSuccess }: InvoiceListProps) {
  const t = useTranslations('invoices')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const localeMap: Record<string, string> = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
    fr: 'fr-FR'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(localeMap[locale] || 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(localeMap[locale] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status !== "all" && { status }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/invoices?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }

      const data = await response.json()
      setInvoices(data.invoices)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, search])

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      toast.success('Invoice deleted successfully')
      fetchInvoices()
      onSuccess?.()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Failed to delete invoice')
    }
  }

  return (
    <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {t('yourInvoices')}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {t('manageInvoices')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:border-blue-400 focus:outline-none min-w-[140px]"
          >
            <option value="all" className="bg-gray-800">{t('allStatuses')}</option>
            <option value="PENDING" className="bg-gray-800">{t('statuses.pending')}</option>
            <option value="PAID" className="bg-gray-800">{t('statuses.paid')}</option>
            <option value="OVERDUE" className="bg-gray-800">{t('statuses.overdue')}</option>
            <option value="CANCELLED" className="bg-gray-800">{t('statuses.cancelled')}</option>
          </select>
        </div>

        {/* Invoice List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-gray-400 mb-4">{t('noInvoices')}</p>
            <p className="text-sm text-gray-500">{t('startCreating')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {invoice.invoiceNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                        {statusEmojis[invoice.status as keyof typeof statusEmojis]} {t(`statuses.${invoice.status.toLowerCase()}`)}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-1">{invoice.clientName}</p>
                    <p className="text-sm text-gray-400 mb-2">{invoice.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>{t('amount')}: <span className="text-green-400 font-medium">{formatCurrency(invoice.amount)}</span></span>
                      <span>{t('due')}: {formatDate(invoice.dueDate)}</span>
                      <span>{t('issued')}: {formatDate(invoice.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(invoice)}
                      className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      {tCommon('edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(invoice.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      {tCommon('delete')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {tCommon('previous')}
            </Button>
            <span className="text-gray-300 px-4">
              {tCommon('page')} {pagination.page} {tCommon('of')} {pagination.pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages}
              className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {tCommon('next')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}