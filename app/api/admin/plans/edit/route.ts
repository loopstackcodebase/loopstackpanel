import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanModel } from "@/app/model/plan/plan.model";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { plan_id, plan_name, plan_validity_days, plan_price, status } = body;

    // Validation
    if (!plan_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: "plan_id is required" 
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(plan_id)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid plan_id format" 
        },
        { status: 400 }
      );
    }

    // Find the plan
    const existingPlan = await PlanModel.findById(plan_id);
    if (!existingPlan) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Plan not found" 
        },
        { status: 404 }
      );
    }

    // Prepare update object
    const updateData: Record<string, any> = {};

    if (plan_name !== undefined) {
      if (!plan_name.trim()) {
        return NextResponse.json(
          { 
            success: false, 
            message: "plan_name cannot be empty" 
          },
          { status: 400 }
        );
      }

      // Check if new plan name already exists (excluding current plan)
      const nameExists = await PlanModel.findOne({ 
        plan_name, 
        _id: { $ne: plan_id } 
      });
      if (nameExists) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Plan with this name already exists" 
          },
          { status: 409 }
        );
      }
      updateData.plan_name = plan_name;
    }

    if (plan_validity_days !== undefined) {
      if (typeof plan_validity_days !== "number" || plan_validity_days < 1) {
        return NextResponse.json(
          { 
            success: false, 
            message: "plan_validity_days must be a positive number" 
          },
          { status: 400 }
        );
      }
      updateData.plan_validity_days = plan_validity_days;
    }

    if (plan_price !== undefined) {
      if (typeof plan_price !== "number" || plan_price < 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: "plan_price must be a non-negative number" 
          },
          { status: 400 }
        );
      }
      updateData.plan_price = plan_price;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return NextResponse.json(
          { 
            success: false, 
            message: "status must be either 'active' or 'inactive'" 
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update the plan
    const updatedPlan = await PlanModel.findByIdAndUpdate(
      plan_id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Edit plan error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}