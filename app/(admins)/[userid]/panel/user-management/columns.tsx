"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Define the Owner type based on the API response
export type Owner = {
  _id: string
  username: string  
  phoneNumber: string
  status: string
  createdAt: string
  type: string
  updatedAt: string
}

export const columns: ColumnDef<Owner>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <div className="text-sm">{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return <div className="text-sm">{format(new Date(date), "PPP")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          className={
            status === "active" 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const owner = row.original
      
      return (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // This would be implemented in the parent component
            console.log("Toggle status for:", owner._id)
          }}
        >
          {owner.status === "active" ? "Deactivate" : "Activate"}
        </Button>
      )
    },
  },
]