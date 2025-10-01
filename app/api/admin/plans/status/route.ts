import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { PlanModel } from "@/app/model/plan/plan.model";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { plan_id, status } = body;

    // Validate required fields
    if (!plan_id) {
      return NextResponse.json(
        { success: false, message: "Plan ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status is required (active or inactive)" },
        { status: 400 }
      );
    }

    // Find the plan by ID
    const plan = await PlanModel.findById(plan_id);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Update the plan status
    plan.status = status;
    await plan.save();

    return NextResponse.json({
      success: true,
      message: `Plan status updated to ${status} successfully`,
      data: {
        plan_id: plan._id,
        plan_name: plan.plan_name,
        status: plan.status,
        updated_at: plan.updatedAt,
      },
    });
  } catch (error) {
    console.error("Plan status update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const plan_id = searchParams.get("plan_id");

    // Validate required fields
    if (!plan_id) {
      return NextResponse.json(
        { success: false, message: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Find the plan by ID
    const plan = await PlanModel.findById(plan_id).select("plan_name status createdAt updatedAt");

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        plan_id: plan._id,
        plan_name: plan.plan_name,
        status: plan.status,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt,
      },
    });
  } catch (error) {
    console.error("Plan status fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}