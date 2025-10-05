"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Plan = {
  _id: string
  plan_name: string
  plan_validity_days: number
  plan_price: number
  products_list_count?: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface ColumnsProps {
  onStatusToggle: (planId: string, currentStatus: string) => void
  statusUpdateLoading: string | null
  onEditPlan: (plan: Plan) => void
}

export const createColumns = ({ onStatusToggle, statusUpdateLoading, onEditPlan }: ColumnsProps): ColumnDef<Plan>[] => [
  {
    accessorKey: "plan_name",
    header: "Plan Name",
    cell: ({ row }) => {
      const planName = row.getValue("plan_name") as string
      return (
        <div className="font-medium">
          {planName}
        </div>
      )
    },
  },
  {
    accessorKey: "plan_validity_days",
    header: "Validity (Days)",
    cell: ({ row }) => {
      const days = row.getValue("plan_validity_days") as number
      return (
        <div className="text-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {days} days
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "plan_price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("plan_price") as number
      return (
        <div className="font-medium text-green-600">
          ${price.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: "products_list_count",
    header: "Products Count",
    cell: ({ row }) => {
      const count = row.getValue("products_list_count") as number | undefined
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {count || 0} products
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="text-sm text-gray-600">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={status === "active" ? "default" : "secondary"}
          className={
            status === "active" 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const plan = row.original
      const isLoading = statusUpdateLoading === plan._id

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditPlan(plan)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onStatusToggle(plan._id, plan.status)}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {plan.status === "active" ? "Deactivate" : "Activate"} Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// Default columns export for backward compatibility
export const columns: ColumnDef<Plan>[] = []