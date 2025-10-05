import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanModel } from "@/app/model/plan/plan.model";
import {
  processQueryParameters,
  executePaginatedQuery,
} from "@/utils/queryProcessor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Define searchable fields for the Plan model
    const searchableFields = [
      "plan_name",
      "status",
      "plan_price",
      "plan_validity_days",
      "products_list_count",
      "description",
    ];

    // Process all query parameters using the global utility
    const processedQuery = processQueryParameters(
      req,
      searchableFields,
      "createdAt" // Date field to use for sorting/filtering
    );

    // Execute the paginated query
    const result = await executePaginatedQuery(
      PlanModel,
      processedQuery,
      "-__v", // Exclude version field
      { createdAt: -1 } // Sort by creation date (newest first)
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: result.filters,
      message: `Found ${result.pagination.total} plans`,
    });
  } catch (error) {
    console.error("Enhanced plan list error:", error);
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
