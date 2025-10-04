"use client"

import React, { useEffect, useState, useCallback } from "react"
import { DataTable } from "./data-table"
import {  Plan } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { CreatePlanDialog } from "./create-plan-dialog"
import { EditPlanDialog } from "./edit-plan-dialog"

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdateLoading] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  
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

  // Fetch plans data
  const fetchPlans = useCallback(async () => {
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
      
      const response = await fetch(`/api/admin/plans/list?${params.toString()}`, {
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
        setPlans(data.data)
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPrevPage: data.pagination.hasPrevPage || false
        })
      } else {
        throw new Error(data.message || "Failed to fetch plans")
      }
    } catch (err) {
      setError((err as Error).message)
      console.error(`Failed to fetch plans: ${(err as Error).message}`)
      // Set empty data on error
      setPlans([])
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

  // Handle status toggle
  const handleToggleStatus = async (planId: string, currentStatus: string) => {
    try {
      // Get token from cookies
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
      const newStatus = currentStatus === "active" ? "inactive" : "active"

      const response = await fetch("/api/admin/plans/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          plan_id: planId,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the plans list
        await fetchPlans()
      } else {
        throw new Error(data.message || "Failed to update plan status")
      }
    } catch (err) {
      console.error("Failed to toggle plan status:", err)
      setError((err as Error).message)
    }
  }

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

  // Handle plan creation
  const handlePlanCreated = () => {
    setCreateDialogOpen(false)
    fetchPlans() // Refresh the list
  }

  // Handle plan edit
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setEditDialogOpen(true)
  }

  const handlePlanUpdated = () => {
    setEditDialogOpen(false)
    setEditingPlan(null)
    fetchPlans() // Refresh the list
  }

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchPlans()
  }, [pagination.page, pagination.limit, searchQuery, dateFilter, fetchPlans])

  if (isLoading && plans.length === 0) {
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
          <h1 className="text-2xl sm:text-3xl font-bold">Plan Management</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans for store owners</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPlans}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <DataTable 
        data={plans}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onDateFilter={handleDateFilter}
        isLoading={isLoading}
        onStatusToggle={handleToggleStatus}
        statusUpdateLoading={statusUpdateLoading}
        onEditPlan={handleEditPlan}
      />

      <CreatePlanDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onPlanCreated={handlePlanCreated}
      />

      <EditPlanDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        plan={editingPlan}
        onPlanUpdated={handlePlanUpdated}
      />
    </div>
  )
}