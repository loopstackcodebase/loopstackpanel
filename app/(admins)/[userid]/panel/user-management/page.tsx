"use client"

import React, { useEffect, useState } from "react"
import { DataTable } from "./data-table"
import { columns, Owner } from "./columns"

import { Loader2 } from "lucide-react"

export default function UserManagementPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null)
  
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

  // Fetch owners data
  const fetchOwners = async () => {
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
      
      const response = await fetch(`/api/admin/owner-list?${params.toString()}`, {
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
        setOwners(data.data)
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage || false,
          hasPrevPage: data.pagination.hasPrevPage || false
        })
      } else {
        throw new Error(data.message || "Failed to fetch owners")
      }
    } catch (err) {
      setError((err as Error).message)
      console.error(`Failed to fetch owners: ${(err as Error).message}`)
      // Set empty data on error
      setOwners([])
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
  }

  // Toggle owner status
  const toggleOwnerStatus = async (ownerId: string) => {
    setStatusUpdateLoading(ownerId)
    setError(null) // Clear any previous errors
    
    try {
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
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      const response = await fetch(`/api/admin/owner-status/${ownerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Failed to parse server response: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
      
      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update owner status");
      }
      
      // Update the owner in the local state to avoid a full refetch
      setOwners(prevOwners => 
        prevOwners.map(owner => 
          owner._id === ownerId 
            ? { ...owner, status: data.data.status } 
            : owner
        )
      );
      
      // Show success message (could be replaced with a toast notification)
      console.log(`Successfully ${data.data.status === 'active' ? 'activated' : 'deactivated'} user`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Status update failed: ${errorMessage}`);
      console.error(`Failed to update status: ${errorMessage}`);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setStatusUpdateLoading(null);
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }))
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle date filter change
  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter)
    setPagination(prev => ({ ...prev, page: 1 }))
  }
  
  // Handle reset of all filters
  const handleReset = () => {
    setSearchQuery("")
    setDateFilter("")
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: 10
    }))
  }

  // Update columns with status toggle handler
  const enhancedColumns = React.useMemo(() => {
    return columns.map(column => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }: any) => {
            const owner = row.original;
            const isLoading = statusUpdateLoading === owner._id;
            
            return (
              <button 
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2`}
                onClick={() => toggleOwnerStatus(owner._id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {owner.status === "active" ? "Deactivate" : "Activate"}
              </button>
            );
          }
        };
      }
      return column;
    });
  }, [statusUpdateLoading]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchOwners()
  }, [pagination.page, pagination.limit, searchQuery, dateFilter])

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 text-black">
  
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 sm:p-4 mb-4 sm:mb-6 text-sm sm:text-base">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
        <DataTable
          columns={enhancedColumns}
          data={owners}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onSearch={handleSearch}
          onDateFilterChange={handleDateFilterChange}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
