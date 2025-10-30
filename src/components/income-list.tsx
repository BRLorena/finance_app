"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Trash2, Edit, Plus, Search, Filter } from "lucide-react"
import { IncomeForm } from "./income-form"

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

interface IncomeListProps {
  showForm?: boolean
  onFormToggle?: (show: boolean) => void
}

export function IncomeList({ showForm = false, onFormToggle }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const categories = [
    "Salary",
    "Freelance", 
    "Business",
    "Investment",
    "Rental",
    "Other"
  ]

  const fetchIncomes = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (selectedCategory) params.append('category', selectedCategory)
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)

      const response = await fetch(`/api/incomes?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch incomes')
      }

      const data = await response.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIncomes(data.incomes.map((income: any) => ({
        ...income,
        date: new Date(income.date),
        createdAt: new Date(income.createdAt),
        updatedAt: new Date(income.updatedAt),
      })))
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching incomes:', error)
      toast.error('Failed to load incomes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, dateRange])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete income')
      }

      toast.success('Income deleted successfully!')
      fetchIncomes(pagination.page)
    } catch (error) {
      console.error('Error deleting income:', error)
      toast.error('Failed to delete income')
    }
  }

  const handleFormSuccess = () => {
    fetchIncomes(pagination.page)
    setEditingIncome(null)
    onFormToggle?.(false)
  }

  const filteredIncomes = incomes.filter((income) =>
    income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)

  if (showForm || editingIncome) {
    return (
      <div className="space-y-6">
        <IncomeForm
          income={editingIncome || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setEditingIncome(null)
            onFormToggle?.(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Your Income History
          </h2>
          <p className="text-gray-400 mt-1">Track and manage your income sources</p>
        </div>
        <Button
          onClick={() => onFormToggle?.(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Income
        </Button>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-200">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search income..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-200">
                Category
              </Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:border-green-400 focus:outline-none"
              >
                <option value="" className="bg-gray-800">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-200">
                From Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-white/5 border-white/20 text-white focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-200">
                To Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-white/5 border-white/20 text-white focus:border-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-300 text-sm">Total Income</p>
              <p className="text-3xl font-bold text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Count</p>
              <p className="text-xl font-semibold text-white">{filteredIncomes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      ) : filteredIncomes.length === 0 ? (
        <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 text-lg">No income entries found</p>
            <p className="text-gray-500 text-sm mt-2">Start by adding your first income source</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIncomes.map((income) => (
            <Card key={income.id} className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">{income.description}</h3>
                      <span className="text-2xl font-bold text-green-300">${income.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-200">
                        {income.category}
                      </span>
                      <span className="text-gray-300">{income.date.toLocaleDateString()}</span>
                      {income.recurring && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200">
                          🔄 {income.frequency || 'Recurring'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingIncome(income)}
                      className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(income.id)}
                      className="border-red-400/20 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => fetchIncomes(pagination.page - 1)}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            Previous
          </Button>
          <span className="text-gray-300 px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchIncomes(pagination.page + 1)}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}