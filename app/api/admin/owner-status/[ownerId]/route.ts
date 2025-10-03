import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    // Connect to database
    await connectToDatabase();
    
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
    const newStatus = owner.status === "active" ? "inactive" : "active";
    owner.status = newStatus;
    await owner.save();

    return NextResponse.json({
      success: true,
      message: `Owner status changed to ${newStatus}`,
      data: { id: owner._id, status: newStatus },
    });
  } catch (error) {
    console.error("Change owner status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, message: `Failed to update owner status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
