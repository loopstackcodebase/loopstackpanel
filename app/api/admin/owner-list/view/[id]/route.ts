import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/dbconfig";
import { UserModel } from "@/app/model/users/user.schema";
import { StoreModel } from "@/app/model/store/store.schema";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get username from params
    const username = params.id;
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user by username - exclude password field
    const user = await UserModel.findOne({ username }).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the store associated with this user - only select required fields
    const store: any = await StoreModel.findOne({ ownerId: (user as any)._id })
      .select("_id displayName email statistics.products")
      .lean();

    // Format the store data to match expected structure
    const formattedStore = store
      ? {
          _id: store._id,
          storeName: store.displayName || "",
          displayName: store.displayName || "",
          products: store.statistics?.products || "0",
          email: store.email || "",
        }
      : null;

    // Return the user and simplified store details
    return NextResponse.json({
      success: true,
      data: {
        user,
        store: formattedStore,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
