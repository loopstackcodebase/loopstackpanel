import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanHistoryModel } from "@/app/model/plan-history/plan.history";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Search parameter (key:value format)
    const search = searchParams.get("search");
    
    // Date filter parameter (specific date search)
    const dateFilter = searchParams.get("date");
    
    // Sort parameter (this month, last month, last 6 months, last one year, last 2 years)
    const sort = searchParams.get("sort");

    // Build query object
    let query: any = {};

    // Handle search functionality (key:value format)
    if (search) {
      try {
        const searchParts = search.split(":");
        if (searchParts.length === 2) {
          const [key, value] = searchParts;
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();
          
          if (trimmedKey === "buyed_owner_username") {
            query.buyed_owner_username = { $regex: trimmedValue, $options: "i" };
          } else if (trimmedKey === "status") {
            query.status = trimmedValue;
          } else if (trimmedKey === "plan_id") {
            query.plan_id = trimmedValue;
          }
        } else {
          // If not in key:value format, search across multiple fields
          query.$or = [
            { buyed_owner_username: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } }
          ];
        }
      } catch (error) {
        // If search parsing fails, do a general search
        query.$or = [
          { buyed_owner_username: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } }
        ];
      }
    }

    // Handle date filter (specific date search on buyed_date)
    if (dateFilter) {
      try {
        const filterDate = new Date(dateFilter);
        if (!isNaN(filterDate.getTime())) {
          const startOfDay = new Date(filterDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(filterDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          query.buyed_date = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        }
      } catch (error) {
        console.error("Invalid date filter:", error);
      }
    }

    // Handle sort parameter (time-based filtering on buyed_date)
    if (sort) {
      const now = new Date();
      let startDate: Date | null = null;

      switch (sort.toLowerCase()) {
        case "this month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          query.buyed_date = { $gte: startDate, $lte: endDate };
          break;
        case "last 6 months":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "last one year":
        case "last 1 year":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "last 2 years":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 2);
          break;
        default:
          startDate = null;
      }

      if (startDate && sort.toLowerCase() !== "last month") {
        if (query.buyed_date) {
          query.buyed_date.$gte = startDate;
        } else {
          query.buyed_date = { $gte: startDate };
        }
      }
    }

    // Execute query with pagination and populate plan details
    const planHistory = await PlanHistoryModel.find(query)
      .populate('plan_id', 'plan_name plan_validity_days plan_price status')
      .skip(skip)
      .limit(limit)
      .sort({ buyed_date: -1 });

    // Get total count for pagination
    const total = await PlanHistoryModel.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: planHistory,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        search: search || null,
        dateFilter: dateFilter || null,
        sort: sort || null,
      },
    });
  } catch (error) {
    console.error("Plan history list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}