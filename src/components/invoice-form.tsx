"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { invoiceFormSchema, type InvoiceFormInput } from "../lib/validations"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { toast } from "sonner"

interface InvoiceFormProps {
  invoice?: {
    id: string
    invoiceNumber: string
    clientName: string
    clientEmail?: string
    amount: number
    description: string
    dueDate: Date
    issueDate: Date
    status: string
    notes?: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

const statuses = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice
      ? {
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail || "",
          amount: invoice.amount.toString(),
          description: invoice.description,
          dueDate: invoice.dueDate.toISOString().split('T')[0],
          issueDate: invoice.issueDate.toISOString().split('T')[0],
          status: (invoice.status as "PENDING" | "PAID" | "OVERDUE" | "CANCELLED") || "PENDING",
          notes: invoice.notes || "",
        }
      : {
          issueDate: new Date().toISOString().split('T')[0],
          status: "PENDING" as const,
        },
  })

  const onSubmit = async (data: InvoiceFormInput) => {
    setIsLoading(true)
    
    try {
      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices'
      const method = invoice ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Something went wrong')
      }

      toast.success(invoice ? 'Invoice updated successfully!' : 'Invoice created successfully!')
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting invoice:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {invoice ? 'Update your invoice details' : 'Generate a professional invoice for your client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-200">
                Invoice Number (Optional)
              </Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-001 (auto-generated if empty)"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("invoiceNumber")}
              />
              {errors.invoiceNumber && (
                <p className="text-red-400 text-sm">{errors.invoiceNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sm font-medium text-gray-200">
                Client Name *
              </Label>
              <Input
                id="clientName"
                placeholder="John Doe"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("clientName")}
              />
              {errors.clientName && (
                <p className="text-red-400 text-sm">{errors.clientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-200">
                Client Email (Optional)
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="john@example.com"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("clientEmail")}
              />
              {errors.clientEmail && (
                <p className="text-red-400 text-sm">{errors.clientEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-gray-200">
                Amount ($) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-red-400 text-sm">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-200">
                Description *
              </Label>
              <Input
                id="description"
                placeholder="Services provided..."
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-400 text-sm">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-sm font-medium text-gray-200">
                  Issue Date *
                </Label>
                <Input
                  id="issueDate"
                  type="date"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                  {...register("issueDate")}
                />
                {errors.issueDate && (
                  <p className="text-red-400 text-sm">{errors.issueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-200">
                  Due Date *
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                  {...register("dueDate")}
                />
                {errors.dueDate && (
                  <p className="text-red-400 text-sm">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-200">
                Status
              </Label>
              <select
                id="status"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 focus:outline-none"
                {...register("status")}
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value} className="bg-gray-800 text-white">
                    {status.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-400 text-sm">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-200">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="Additional notes..."
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-red-400 text-sm">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}