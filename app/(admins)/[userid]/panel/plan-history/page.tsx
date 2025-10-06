"use client"

import React, { useEffect, useState, useCallback } from "react"
import { DataTable } from "./data-table"
import { PlanHistory } from "./columns"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function PlanHistoryPage() {
  const [planHistory, setPlanHistory] = useState<PlanHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  
  // Pagination and filter state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Fetch plan history data
  const fetchPlanHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.append("page", pagination.page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (searchQuery) {
        queryParams.append("search", searchQuery)
      }
      
      if (dateFilter) {
        if (dateFilter.includes("-")) {
          // If it's a specific date format (DD-MM-YYYY or YYYY-MM-DD)
          queryParams.append("date", dateFilter)
        } else {
          // If it's a time-based filter like "lastweek", "lastmonth", etc.
          queryParams.append("sort", dateFilter)
        }
      }

      if (statusFilter) {
        queryParams.append("status", statusFilter)
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
      
      const response = await fetch(`/api/admin/plans/history?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPlanHistory(data.data)
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPrevPage: data.pagination.hasPrevPage || false
        })
      } else {
        throw new Error(data.message || "Failed to fetch plan history")
      }
    } catch (err) {
      setError((err as Error).message)
      console.error(`Failed to fetch plan history: ${(err as Error).message}`)
      // Set empty data on error
      setPlanHistory([])
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }))
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, searchQuery, dateFilter, statusFilter])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle date filter
  const handleDateFilter = (filter: string) => {
    setDateFilter(filter)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle username click
  const handleUsernameClick = (username: string) => {
    router.push(`/${params.userid}/panel/user-management/view/${username}`)
  }

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchPlanHistory()
  }, [pagination.page, pagination.limit, searchQuery, dateFilter, statusFilter, fetchPlanHistory])

  if (isLoading && planHistory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Plan History</h1>
          <p className="text-gray-600 mt-1">View subscription plan purchase history</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPlanHistory}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <DataTable 
        data={planHistory}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onDateFilter={handleDateFilter}
        onStatusFilter={handleStatusFilter}
        onUsernameClick={handleUsernameClick}
        isLoading={isLoading}
      />
    </div>
  )
}