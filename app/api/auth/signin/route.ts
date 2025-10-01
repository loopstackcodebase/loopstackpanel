// app/api/auth/login/route.ts
import { UserModel } from "@/app/model/users/user.schema";
import connectToDatabase from "@/app/lib/dbconfig";
import { comparePassword } from "@/app/lib/password";
import { generateToken } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username/phone and password are required",
        },
        { status: 400 }
      );
    }

    // Trim whitespace from username/phone
    const trimmedUsername = username.trim();

    // Find user by username or phone number
    const user: any = await UserModel.findOne({
      $or: [{ username: trimmedUsername }, { phoneNumber: trimmedUsername }],
    }).select("+password"); // Ensure password is included if it's excluded by default

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      type: user.type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Set secure HTTP-only cookie (optional - for enhanced security)
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON format",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
