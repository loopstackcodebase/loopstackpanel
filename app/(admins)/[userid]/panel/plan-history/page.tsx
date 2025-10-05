"use client"

import React, { useEffect, useState, useCallback } from "react"
import { DataTable } from "./data-table"
import { PlanHistory } from "./columns"

export default function PlanHistoryPage() {
  const [planHistory, setPlanHistory] = useState<PlanHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  // Fetch plan history data
  const fetchPlanHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())
      
      if (searchQuery) {
        params.append("search", searchQuery)
      }
      
      if (dateFilter) {
        if (dateFilter.includes("-")) {
          // If it's a specific date format (DD-MM-YYYY or YYYY-MM-DD)
          params.append("date", dateFilter)
        } else {
          // If it's a time-based filter like "lastweek", "lastmonth", etc.
          params.append("sort", dateFilter)
        }
      }
      
      // Fetch data from API
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
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Get token from cookies if available
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
  }, [pagination.page, pagination.limit, searchQuery, dateFilter])

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchPlanHistory()
  }, [fetchPlanHistory])

  // Handle page change
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan History</h1>
          <p className="text-muted-foreground">
            View and manage purchased plan subscriptions by store owners.
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error loading plan history</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={planHistory}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onDateFilter={handleDateFilter}
      />
    </div>
  )
}