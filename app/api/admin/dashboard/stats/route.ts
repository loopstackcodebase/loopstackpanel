import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";
import { PlanHistoryModel } from "@/app/model/plan-history/plan.history";
import { StoreModel } from "@/app/model/store/store.schema";
import { PlanModel } from "@/app/model/plan/plan.model";

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Ensure models are registered
    UserModel;
    PlanHistoryModel;
    StoreModel;
    PlanModel;

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Overall Statistics
    const [
      totalOwners,
      totalStores,
      totalPlanHistories,
      activePlanHistories,
      freePlanOwners,
      // Today's Statistics
      todayRegistrations,
      todayStores,
      todayPlanHistories,
      todayActivePlanHistories
    ] = await Promise.all([
      // Overall Statistics
      UserModel.countDocuments({ type: "owner", status: "active" }),
      StoreModel.countDocuments(),
      PlanHistoryModel.countDocuments(),
      PlanHistoryModel.countDocuments({ expiry_date: { $gt: new Date() } }),
      UserModel.countDocuments({ 
        type: "owner", 
        status: "active",
        $or: [
          { planId: { $exists: false } },
          { planId: null },
          { planHistoryId: { $exists: false } },
          { planHistoryId: null }
        ]
      }),
      
      // Today's Statistics
      UserModel.countDocuments({ 
        type: "owner", 
        status: "active",
        createdAt: { $gte: startOfToday, $lt: endOfToday }
      }),
      StoreModel.countDocuments({
        createdAt: { $gte: startOfToday, $lt: endOfToday }
      }),
      PlanHistoryModel.countDocuments({
        buyed_date: { $gte: startOfToday, $lt: endOfToday }
      }),
      PlanHistoryModel.countDocuments({
        buyed_date: { $gte: startOfToday, $lt: endOfToday },
        expiry_date: { $gt: new Date() }
      })
    ]);

    // Calculate today's free plan registrations
    const todayFreeRegistrations = await UserModel.countDocuments({
      type: "owner",
      status: "active",
      createdAt: { $gte: startOfToday, $lt: endOfToday },
      $or: [
        { planId: { $exists: false } },
        { planId: null },
        { planHistoryId: { $exists: false } },
        { planHistoryId: null }
      ]
    });

    // Get free plan details
    const freePlan = await PlanModel.findOne({ plan_price: 0 });
    const freePlanId = freePlan?._id;

    // If there's a specific free plan, count users with that plan
    let subscribedOwners = activePlanHistories;
    if (freePlanId) {
      const freePlanSubscriptions = await PlanHistoryModel.countDocuments({
        plan_id: freePlanId,
        expiry_date: { $gt: new Date() }
      });
      subscribedOwners = activePlanHistories - freePlanSubscriptions;
    }

    // Calculate Revenue
    // Total Revenue - sum of all active plan subscriptions
    const totalRevenueData = await PlanHistoryModel.aggregate([
      {
        $match: {
          expiry_date: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: "plans",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$plan.plan_price" }
        }
      }
    ]);

    // Today's Revenue - sum of plan subscriptions purchased today
    const todayRevenueData = await PlanHistoryModel.aggregate([
      {
        $match: {
          buyed_date: { $gte: startOfToday, $lt: endOfToday }
        }
      },
      {
        $lookup: {
          from: "plans",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$plan.plan_price" }
        }
      }
    ]);

    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
    const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].todayRevenue : 0;

    const response = {
      success: true,
      data: {
        overall: {
          totalOwners,
          totalProducts: totalStores, // Using stores as products for now
          subscribedOwners,
          freePlanOwners,
          totalRevenue
        },
        today: {
          registrations: todayRegistrations,
          totalProducts: todayStores, // Using stores as products for now
          subscribedOwners: todayActivePlanHistories - (freePlanId ? await PlanHistoryModel.countDocuments({
            plan_id: freePlanId,
            buyed_date: { $gte: startOfToday, $lt: endOfToday },
            expiry_date: { $gt: new Date() }
          }) : 0),
          freePlanRegistrations: todayFreeRegistrations,
          todayRevenue
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}