import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Optional: pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const owners = await UserModel.find({ type: "owner" })
      .select("-password") // hide password
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await UserModel.countDocuments({ type: "owner" });

    return NextResponse.json({
      success: true,
      data: owners,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Owner list error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
