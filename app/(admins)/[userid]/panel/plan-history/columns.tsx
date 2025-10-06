"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export type PlanHistory = {
  _id: string
  buyed_owner_username: string
  plan_id: {
    _id: string
    plan_name: string
    plan_validity_days: number
    plan_price: number
    status: string
  }
  buyed_date: string
  expiry_date: string
  status: "active" | "expired"
}

interface ColumnsProps {
  onUsernameClick: (username: string) => void
}

export const createColumns = ({ onUsernameClick }: ColumnsProps): ColumnDef<PlanHistory>[] => [
  {
    accessorKey: "buyed_owner_username",
    header: "Username",
    cell: ({ row }) => {
      const username = row.getValue("buyed_owner_username") as string
      return (
        <div 
          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          onClick={() => onUsernameClick(username)}
        >
          {username}
        </div>
      )
    },
  },
  {
    accessorKey: "plan_id",
    header: "Plan Name",
    cell: ({ row }) => {
      const plan = row.getValue("plan_id") as PlanHistory["plan_id"]
      return (
        <div className="font-medium">
          {plan?.plan_name || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "plan_id.plan_price",
    header: "Price",
    cell: ({ row }) => {
      const plan = row.getValue("plan_id") as PlanHistory["plan_id"]
      return (
        <div className="font-medium text-green-600">
          ${plan?.plan_price?.toFixed(2) || "0.00"}
        </div>
      )
    },
  },
  {
    accessorKey: "plan_id.plan_validity_days",
    header: ({ column }) => (
      <div className="text-center">Validity (Days)</div>
    ),
    cell: ({ row }) => {
      const plan = row.getValue("plan_id") as PlanHistory["plan_id"]
      return (
        <div className="text-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {plan?.plan_validity_days || 0} days
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "buyed_date",
    header: "Purchase Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("buyed_date"))
      return (
        <div className="text-sm text-gray-600">
          {format(date, "MMM dd, yyyy")}
        </div>
      )
    },
  },
  {
    accessorKey: "expiry_date",
    header: "Expiry Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("expiry_date"))
      return (
        <div className="text-sm text-gray-600">
          {format(date, "MMM dd, yyyy")}
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
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {status === "active" ? "Active" : "Expired"}
        </Badge>
      )
    },
  },
]

// Default columns export for backward compatibility
export const columns: ColumnDef<PlanHistory>[] = createColumns({
  onUsernameClick: () => {}
})