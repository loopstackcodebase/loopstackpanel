// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserModel, UserType } from "@/app/model/users/user.schema";
import { StoreModel } from "@/app/model/store/store.schema"; // Import your store model
import { hashPassword } from "@/app/lib/password";
import connectToDatabase from "@/app/lib/dbconfig";
import { generateToken } from "@/utils/jwt";

export const dynamic = "force-dynamic";

// Default store data
const getDefaultStoreData = (
  userId: string,
  userEmail: string,
  displayName: string
) => ({
  displayName: displayName,
  ownerId: userId,
  description: "Premium quality products with exceptional customer service",
  email: userEmail,
  logo: "https://i.imghippo.com/files/RXA1166Gck.jpg",

  contact: {
    getInTouchContent:
      "Our customer support team is here to help you with any questions, concerns, or feedback. We're committed to providing you with the best shopping experience possible.",
    whatsAppSupport: "+1 (555) 123-4567",
    emailSupport: "support@yourstore.com",
    available24x7: true,
    responseTime: "Response within 24 hours",
  },

  businessHours: [
    { day: "Monday", isOpen: true },
    { day: "Tuesday", isOpen: true },
    {
      day: "Wednesday",
      isOpen: true,
    },
    {
      day: "Thursday",
      isOpen: true
    },
    { day: "Friday", isOpen: true },
    {
      day: "Saturday",
      isOpen: true,
    },
    { day: "Sunday", isOpen: false },
  ],

  quickHelp: {
    liveChatSupport: true,
    technicalSupport: true,
    accountHelp: false,
  },

  aboutUs: {
    ourStory:
      "Founded with a passion for quality and customer satisfaction, we've been serving customers worldwide with premium products and exceptional service. Our journey began with a simple mission: to make online shopping a delightful experience for everyone.",
    mission:
      "To provide high-quality products at competitive prices while delivering exceptional customer service that exceeds expectations. We strive to build lasting relationships with our customers through trust, reliability, and innovation.",
    vision:
      "To become the world's most trusted online marketplace, where customers can find everything they need with confidence. We envision a future where shopping is seamless, sustainable, and accessible to everyone.",
    values: {
      trust:
        "We build trust through transparency, reliability, and consistent quality in everything we do.",
      excellence:
        "We strive for excellence in our products, services, and customer relationships.",
      sustainability:
        "We're committed to sustainable practices and environmental responsibility.",
      community:
        "We believe in building strong communities and giving back to society.",
    },
    whyChooseUs: {
      secureShopping:
        "Your data and transactions are protected with industry-leading security measures.",
      fastDelivery:
        "Quick and reliable shipping options to get your products delivered on time.",
      customerFirst:
        "Our dedicated support team is always ready to help you with any questions or concerns.",
    },
    statistics: {
      happyCustomers: "10K+",
      products: "500+",
      countriesServed: "50+",
      uptime: "99.9%",
    },
    ourTeam:
      "We're a passionate team of professionals dedicated to making your shopping experience exceptional. From our customer service representatives to our logistics experts, everyone works together to ensure your satisfaction.",
  },
});

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { username, phoneNumber, password, type = "owner", email } = body;

    // Validate required fields
    if (!username || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, phone number, and password are required",
        },
        { status: 400 }
      );
    }

    // Validate user type
    if (type && !["owner", "admin"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid user type. Must be either "owner" or "admin"',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { phoneNumber }],
    });

    if (existingUser) {
      const field =
        existingUser.username === username ? "Username" : "Phone number";
      return NextResponse.json(
        {
          success: false,
          message: `${field} already exists`,
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new UserModel({
      username: username.trim(),
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
      type: type as UserType,
      email: email || "", // Add email if provided
    });

    // Save user to database
    const savedUser: any = await newUser.save();

    // Create default store for the user
    const defaultStoreData = getDefaultStoreData(
      savedUser._id,
      email || `${username}@yourstore.com`, // Use provided email or generate one
      `${username}'s Store`
    );

    const newStore = new StoreModel(defaultStoreData);
    const savedStore = await newStore.save();

    // Generate JWT token
    const token = generateToken(savedUser, savedStore._id);

    // Remove password from response
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      phoneNumber: savedUser.phoneNumber,
      type: savedUser.type,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    const storeResponse = {
      id: savedStore._id,
      displayName: savedStore.displayName,
      description: savedStore.description,
      email: savedStore.email,
      logo: savedStore.logo,
      createdAt: savedStore.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully and store created",
        data: {
          user: userResponse,
          store: storeResponse,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          message: `${field} already exists`,
        },
        { status: 409 }
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
