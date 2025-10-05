import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanHistoryModel } from "@/app/model/plan-history/plan.history";
import { UserModel } from "@/app/model/users/user.schema";
import { StoreModel } from "@/app/model/store/store.schema";
import {
  processQueryParameters,
  executePaginatedQuery,
} from "@/utils/queryProcessor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

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

    // Populate plan details manually after the query
    const populatedData = await PlanHistoryModel.populate(result.data, {
      path: 'plan_id',
      select: 'plan_name plan_validity_days plan_price status description'
    });

    // Enhance data with user and store details
    const enhancedData = await Promise.all(
      populatedData.map(async (historyItem: any) => {
        try {
          // Find user by username
          const user = await UserModel.findOne(
            { username: historyItem.buyed_owner_username, type: "owner" },
            { username: 1, phoneNumber: 1, status: 1, createdAt: 1 }
          );

          let storeDetails = null;
          if (user) {
            // Find store by owner ID
            const store = await StoreModel.findOne(
              { ownerId: user._id },
              { displayName: 1, email: 1, description: 1 }
            );
            storeDetails = store;
          }

          return {
            ...historyItem.toObject(),
            user_details: user || null,
            store_details: storeDetails,
          };
        } catch (error) {
          console.error(`Error fetching details for ${historyItem.buyed_owner_username}:`, error);
          return {
            ...historyItem.toObject(),
            user_details: null,
            store_details: null,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: enhancedData,
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