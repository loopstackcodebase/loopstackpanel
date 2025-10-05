import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanModel } from "@/app/model/plan/plan.model";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { plan_name, plan_validity_days, plan_price, products_list_count } = body;

    // Validation
    if (!plan_name || !plan_validity_days || plan_price === undefined || products_list_count === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          message: "plan_name, plan_validity_days, plan_price, and products_list_count are required" 
        },
        { status: 400 }
      );
    }

    if (typeof plan_validity_days !== "number" || plan_validity_days < 1) {
      return NextResponse.json(
        { 
          success: false, 
          message: "plan_validity_days must be a positive number" 
        },
        { status: 400 }
      );
    }

    if (typeof plan_price !== "number" || plan_price < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "plan_price must be a non-negative number" 
        },
        { status: 400 }
      );
    }

    if (typeof products_list_count !== "number" || products_list_count < 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "products_list_count must be a non-negative number" 
        },
        { status: 400 }
      );
    }

    // Check if plan name already exists
    const existingPlan = await PlanModel.findOne({ plan_name });
    if (existingPlan) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Plan with this name already exists" 
        },
        { status: 409 }
      );
    }

    // Create new plan
    const newPlan = new PlanModel({
      plan_name,
      plan_validity_days,
      plan_price,
      products_list_count,
    });

    await newPlan.save();

    return NextResponse.json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}