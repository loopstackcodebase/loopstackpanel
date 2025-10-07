import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanHistoryModel } from "@/app/model/plan-history/plan.history";
import { PlanModel } from "@/app/model/plan/plan.model";
import {
  processQueryParameters,
  executePaginatedQuery,
} from "@/utils/queryProcessor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Ensure Plan model is registered by importing it
    // This is necessary for populate to work
    PlanModel;

    // Get status filter from query parameters
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    // Define searchable fields for plan history (only string fields for text search)
    const searchableFields = [
      "buyed_owner_username",
    ];

    // Process all query parameters using the global utility
    const processedQuery = processQueryParameters(
      req,
      searchableFields,
      "buyed_date" // Date field to use for sorting/filtering
    );

    // Execute the paginated query
    const result = await executePaginatedQuery(
      PlanHistoryModel,
      processedQuery,
      "-__v", // Exclude version field
      { buyed_date: -1 } // Sort by purchase date (newest first)
    );

    // Populate plan details - this should work now that Plan model is registered
    const populatedData = await PlanHistoryModel.populate(result.data, {
      path: 'plan_id',
      select: 'plan_name plan_validity_days plan_price status'
    });

    // Filter by expired/active status if requested
    let filteredData = populatedData;
    if (statusFilter && (statusFilter === "expired" || statusFilter === "active")) {
      const currentDate = new Date();
      
      filteredData = populatedData.filter((historyItem: any) => {
        // Use the existing expiry_date field from the database if available
        if (historyItem.expiry_date) {
          const expiryDate = new Date(historyItem.expiry_date);
          const isExpired = currentDate > expiryDate;

          if (statusFilter === "expired") {
            return isExpired;
          } else if (statusFilter === "active") {
            return !isExpired;
          }
        }
        
        // Fallback: use the status field from the database if expiry_date is not available
        if (historyItem.status) {
          if (statusFilter === "expired") {
            return historyItem.status === "expired";
          } else if (statusFilter === "active") {
            return historyItem.status === "active";
          }
        }
        
        return true;
      });

      // Update pagination info based on filtered results
      const filteredTotal = filteredData.length;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Apply pagination to filtered data
      const paginatedFilteredData = filteredData.slice(startIndex, endIndex);
      
      // Update pagination object
      const updatedPagination = {
        ...result.pagination,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
        hasNextPage: endIndex < filteredTotal,
        hasPrevPage: page > 1
      };

      return NextResponse.json({
        success: true,
        data: paginatedFilteredData,
        pagination: updatedPagination,
        filters: result.filters,
        message: `Found ${filteredTotal} ${statusFilter} plan history records`,
      });
    }

    return NextResponse.json({
      success: true,
      data: populatedData,
      pagination: result.pagination,
      filters: result.filters,
      message: `Found ${result.pagination.total} plan history records`,
    });
  } catch (error) {
    console.error("Plan history list error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}