"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { PlanHistory, createColumns } from "./columns"

interface DataTableProps {
  data: PlanHistory[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage?: boolean
    hasPrevPage?: boolean
  }
  isLoading: boolean
  onPageChange: (page: number) => void
  onSearch: (value: string) => void
  onDateFilter: (filter: string) => void
  onStatusFilter: (status: string) => void
  onUsernameClick: (username: string) => void
}

export function DataTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onSearch,
  onDateFilter,
  onStatusFilter,
  onUsernameClick,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateInputValue, setDateInputValue] = React.useState("")

  // Create columns with handlers
  const columns = React.useMemo(() => 
    createColumns({ onUsernameClick }), 
    [onUsernameClick]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    pageCount: pagination.totalPages,
  })

  const handleSearch = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      
      // Debounce search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        onSearch(value)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    },
    [onSearch]
  )

  const handleLimitChange = (limit: number) => {
    // Reset to first page when changing limit
    onPageChange(1)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
        {/* Search input - full width on mobile */}
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search plan history..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        
        {/* Filter controls - stack on mobile, row on desktop */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Input
            type="date"
            placeholder="Select date..."
            value={dateInputValue}
            onChange={(e) => {
              const value = e.target.value;
              setDateInputValue(value);
              if (value) {
                // Convert YYYY-MM-DD to DD-MM-YYYY format for the API
                const [year, month, day] = value.split('-');
                onDateFilter(`${day}-${month}-${year}`);
              } else {
                onDateFilter("");
              }
            }}
            className="w-full sm:w-40"
          />
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto hover:cursor-pointer">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Filter by Period</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("lastweek");
                }}>
                  Last Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("lastmonth");
                }}>
                  Last Month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("last6months");
                }}>
                  Last 6 Months
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("lastyear");
                }}>
                  Last Year
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("last2years");
                }}>
                  Last 2 Years
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setDateInputValue("");
                  onDateFilter("");
                }}>
                  All Time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto hover:cursor-pointer">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Filter by Status</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStatusFilter("active")}>
                  Active Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilter("expired")}>
                  Expired Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilter("")}>
                  All Plans
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto hover:cursor-pointer"
              onClick={() => {
                setSearchQuery("");
                setDateInputValue("");
                onDateFilter("");
                onStatusFilter("");
                onSearch("");
              }}
            >
              Reset Filters
            </Button>
          </div>
          
          {/* Items per page selector */}
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => handleLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="10 per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No plan history found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
          Showing {pagination.page > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} entries
        </div>
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="hidden sm:flex hover:cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="sm:hidden hover:cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-center text-sm font-medium px-2">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="hidden sm:flex hover:cursor-pointer"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="sm:hidden hover:cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}