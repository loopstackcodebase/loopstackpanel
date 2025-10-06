"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { columns, PlanHistory } from "./columns"

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function PlanHistoryPage() {
  const [planHistory, setPlanHistory] = useState<PlanHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })

  const fetchPlanHistory = async (page: number = 1, search: string = "", dateFilter: string = "all") => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      if (dateFilter && dateFilter !== 'all') {
        params.append('dateFilter', dateFilter)
      }

      // Function to get cookie value by name
      const getCookie = (name: string): string | null => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };
      
      const token = getCookie("token");

      const response = await fetch(`/api/admin/plans/history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Get token from cookies if available
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setPlanHistory(result.data || [])
        setPagination({
          currentPage: result.pagination?.currentPage || 1,
          totalPages: result.pagination?.totalPages || 1,
          totalItems: result.pagination?.totalItems || 0,
          itemsPerPage: result.pagination?.itemsPerPage || 10
        })
      } else {
        console.error('Failed to fetch plan history:', result.message)
        setPlanHistory([])
      }
    } catch (error) {
      console.error('Error fetching plan history:', error)
      setPlanHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlanHistory(1, searchValue, dateFilter)
  }, [])

  useEffect(() => {
    fetchPlanHistory(1, searchValue, dateFilter)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchPlanHistory(1, value, dateFilter)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
    fetchPlanHistory(1, searchValue, value)
  }

  const handlePageChange = (page: number) => {
    fetchPlanHistory(page, searchValue, dateFilter)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Plan History</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage plan purchase history. Total: {pagination.totalItems} records
          </p>
        </div>
        <div className="p-6">
          <DataTable
          columns={columns}
          data={planHistory}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          isLoading={loading}
        />
        </div>
      </div>
    </div>
  )
}