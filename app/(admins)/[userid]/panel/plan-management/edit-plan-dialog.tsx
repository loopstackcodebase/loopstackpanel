"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, X } from "lucide-react"
import { Plan } from "./columns"

interface EditPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
  onPlanUpdated: () => void
}

export function EditPlanDialog({ open, onOpenChange, plan, onPlanUpdated }: EditPlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    plan_name: "",
    plan_validity_days: "",
    plan_price: "",
    products_list_count: "",
    status: "active" as "active" | "inactive"
  })

  // Update form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        plan_validity_days: plan.plan_validity_days.toString(),
        plan_price: plan.plan_price.toString(),
        products_list_count: (plan.products_list_count || 0).toString(),
        status: plan.status
      })
    }
  }, [plan])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.plan_name.trim()) {
      setError("Plan name is required")
      return false
    }
    if (!formData.plan_validity_days || parseInt(formData.plan_validity_days) < 1) {
      setError("Plan validity must be at least 1 day")
      return false
    }
    if (!formData.plan_price || parseFloat(formData.plan_price) < 0) {
      setError("Plan price must be 0 or greater")
      return false
    }
    if (!formData.products_list_count || parseInt(formData.products_list_count) < 0) {
      setError("Products list count must be 0 or greater")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!plan || !validateForm()) return

    setIsLoading(true)
    setError(null)

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

      const response = await fetch("/api/admin/plans/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          plan_id: plan._id,
          plan_name: formData.plan_name.trim(),
          plan_validity_days: parseInt(formData.plan_validity_days),
          plan_price: parseFloat(formData.plan_price),
          products_list_count: parseInt(formData.products_list_count),
          status: formData.status
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json()

      if (data.success) {
        onPlanUpdated()
      } else {
        throw new Error(data.message || "Failed to update plan")
      }
    } catch (err) {
      setError((err as Error).message)
      console.error("Failed to update plan:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onOpenChange(false)
    }
  }

  if (!plan) return null

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Edit Plan</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Update the subscription plan details.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_plan_name">Plan Name</Label>
            <Input
              id="edit_plan_name"
              placeholder="Enter plan name"
              value={formData.plan_name}
              onChange={(e) => handleInputChange("plan_name", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_plan_validity_days">Validity (Days)</Label>
            <Input
              id="edit_plan_validity_days"
              type="number"
              min="1"
              placeholder="Enter validity in days"
              value={formData.plan_validity_days}
              onChange={(e) => handleInputChange("plan_validity_days", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_plan_price">Price ($)</Label>
            <Input
              id="edit_plan_price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter price"
              value={formData.plan_price}
              onChange={(e) => handleInputChange("plan_price", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_products_list_count">Products List Count</Label>
            <Input
              id="edit_products_list_count"
              type="number"
              min="0"
              placeholder="Enter products list count"
              value={formData.products_list_count}
              onChange={(e) => handleInputChange("products_list_count", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}