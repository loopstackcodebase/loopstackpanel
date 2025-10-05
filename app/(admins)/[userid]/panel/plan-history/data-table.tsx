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
import { PlanHistory, columns } from "./columns"

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
}

export function DataTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onSearch,
  onDateFilter,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateInputValue, setDateInputValue] = React.useState("")

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
      }, 300)

      return () => clearTimeout(timeoutId)
    },
    [onSearch]
  )

  const handleDateFilter = (value: string) => {
    setDateInputValue(value)
    onDateFilter(value)
  }

  const handleDateSort = (sortType: string) => {
    onDateFilter(sortType)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
          
          <Input
            type="date"
            placeholder="Filter by date"
            value={dateInputValue}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="flex gap-2">
          {/* Date Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Date Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDateSort("lastweek")}>
                Last Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateSort("thismonth")}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateSort("lastmonth")}>
                Last Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateSort("last3months")}>
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateSort("last6months")}>
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateSort("lastyear")}>
                Last Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Columns
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      className="capitalize"
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={() => column.toggleVisibility(!column.getIsVisible())}
                        className="mr-2"
                      />
                      {column.id}
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No plan history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || isLoading}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm">Page</span>
            <Select
              value={pagination.page.toString()}
              onValueChange={(value) => onPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm">of {pagination.totalPages}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage || isLoading}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}