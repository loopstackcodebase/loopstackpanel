import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    console.log("Owner ID:", ownerId);

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      return NextResponse.json(
        { success: false, message: "Valid ownerId is required" },
        { status: 400 }
      );
    }

    const owner = await UserModel.findOne({ _id: ownerId, type: "owner" });
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Toggle status
    owner.status = owner.status === "active" ? "inactive" : "active";
    await owner.save();

    return NextResponse.json({
      success: true,
      message: `Owner status changed to ${owner.status}`,
      data: { id: owner._id, status: owner.status },
    });
  } catch (error) {
    console.error("Change owner status error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
