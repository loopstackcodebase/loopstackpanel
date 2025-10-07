"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

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
    cell: ({ row }) => <div className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <div className="text-xs sm:text-sm whitespace-nowrap">{row.getValue("phoneNumber")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return <div className="text-xs sm:text-sm whitespace-nowrap">{format(new Date(date), "PPP")}</div>
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
              ? "bg-green-100 text-green-800 hover:bg-green-200 text-xs sm:text-sm whitespace-nowrap" 
              : "bg-red-100 text-red-800 hover:bg-red-200 text-xs sm:text-sm whitespace-nowrap"
          }
        >
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => {
      const owner = row.original;
      
      return (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs sm:text-sm whitespace-nowrap hover:cursor-pointer px-2 py-1"
          onClick={() => {
            // Navigate to view page using username instead of _id
            const userid = document.location.pathname.split('/')[1];
            window.location.href = `/${userid}/panel/user-management/view/${owner.username}`;
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
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
          className="text-xs sm:text-sm whitespace-nowrap hover:cursor-pointer px-2 py-1 sm:px-3 sm:py-1"
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