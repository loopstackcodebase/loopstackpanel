import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";
import {
  processQueryParameters,
  executePaginatedQuery,
} from "@/utils/queryProcessor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Define searchable fields for the User model
    const searchableFields = ["username", "phoneNumber", "status"];

    // Process all query parameters using the global utility
    const processedQuery = processQueryParameters(
      req,
      searchableFields,
      "createdAt" // Date field to use for sorting/filtering
    );

    // Add the type filter to ensure we only get owners (not admins)
    processedQuery.mongoQuery.type = "owner";

    // Execute the paginated query
    const result = await executePaginatedQuery(
      UserModel,
      processedQuery,
      "-password -__v", // Exclude password and version fields
      { createdAt: -1 } // Sort by creation date (newest first)
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: result.filters,
      message: `Found ${result.pagination.total} owners`,
    });
  } catch (error) {
    console.error("Owner list error:", error);
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
