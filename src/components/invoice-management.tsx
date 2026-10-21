"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import { InvoiceForm } from "./invoice-form"
import { InvoiceList } from "./invoice-list"

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

interface InvoiceManagementProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function InvoiceManagement({ user }: InvoiceManagementProps) {
  const t = useTranslations('invoices')
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
  }

  const handleSuccess = () => {
    setEditingInvoice(null)
    setRefreshKey(prev => prev + 1)
  }

  const handleCancel = () => {
    setEditingInvoice(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-300">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">{t('welcomeBack')}</p>
              <p className="text-white font-semibold">{user.name}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📄</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Form */}
          <div className="lg:col-span-1">
            <InvoiceForm 
              key={refreshKey}
              invoice={editingInvoice ? {
                ...editingInvoice,
                dueDate: new Date(editingInvoice.dueDate),
                issueDate: new Date(editingInvoice.issueDate),
              } : undefined}
              onSuccess={handleSuccess}
              onCancel={editingInvoice ? handleCancel : undefined}
            />
          </div>

          {/* Invoice List */}
          <div className="lg:col-span-2">
            <InvoiceList 
              key={refreshKey}
              onEdit={handleEdit}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  )
}