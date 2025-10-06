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