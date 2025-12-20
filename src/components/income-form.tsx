"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { incomeFormSchema, type IncomeFormInput } from "@/lib/validations"
import { toast } from "sonner"

interface Income {
  id: string
  amount: number
  description: string
  category: string
  date: Date
  recurring: boolean
  frequency?: string
  createdAt: Date
  updatedAt: Date
}

interface IncomeFormProps {
  income?: Income
  onSuccess?: () => void
  onCancel?: () => void
}

const INCOME_CATEGORIES = [
  "salary",
  "freelance",
  "business",
  "investment",
  "rental",
  "other"
]

const FREQUENCIES = [
  "weekly",
  "biWeekly",
  "monthly",
  "quarterly",
  "yearly"
]

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const t = useTranslations('incomes')
  const tCommon = useTranslations('common')
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!income

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IncomeFormInput>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: income ? {
      amount: income.amount.toString(),
      description: income.description,
      category: income.category,
      date: income.date.toISOString().split('T')[0],
      recurring: income.recurring,
      frequency: income.frequency || "",
    } : {
      amount: "",
      description: "",
      category: "",
      date: "",
      recurring: false,
      frequency: "",
    },
  })

  const isRecurring = watch("recurring")

  const onSubmit = async (data: IncomeFormInput) => {
    setIsLoading(true)
    try {
      const url = isEditing ? `/api/incomes/${income.id}` : "/api/incomes"
      const method = isEditing ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} income`)
      }

      toast.success(`Income ${isEditing ? 'updated' : 'added'} successfully!`)
      if (!isEditing) {
        reset()
      }
      onSuccess?.()
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} income:`, error)
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} income`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6">
        {isEditing ? t('editIncome') : t('addIncome')}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="amount" className="text-white">{t('amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="text-white">{t('category')}</Label>
            <select
              id="category"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("category")}
            >
              <option value="">{t('selectCategory')}</option>
              {INCOME_CATEGORIES.map((category) => (
                <option key={category} value={category} className="text-black">
                  {t(`categories.${category}`)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">{t('description')}</Label>
            <Input
              id="description"
              placeholder={t('descriptionPlaceholder')}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date" className="text-white">{t('date')}</Label>
            <Input
              id="date"
              type="date"
              className="bg-white/10 border-white/20 text-white"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              id="recurring"
              type="checkbox"
              className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
              {...register("recurring")}
            />
            <Label htmlFor="recurring" className="text-white">
              {t('recurring')}
            </Label>
          </div>

          {isRecurring && (
            <div>
              <Label htmlFor="frequency" className="text-white">{t('frequency')}</Label>
              <select
                id="frequency"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("frequency")}
              >
                <option value="">{tCommon('select')} {t('frequency').toLowerCase()}</option>
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq} className="text-black">
                    {t(`frequencies.${freq}`)}
                  </option>
                ))}
              </select>
              {errors.frequency && (
                <p className="text-red-400 text-sm mt-1">{errors.frequency.message}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            {isLoading ? tCommon('loading') : (isEditing ? t('updateIncome') : t('addIncome'))}
          </Button>
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {tCommon('cancel')}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}