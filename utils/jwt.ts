// lib/jwt.ts - JWT utilities
import { IUser } from "@/app/model/users/user.schema";
import jwt from "jsonwebtoken";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable");
}

export interface JWTPayload {
  userId: string;
  username: string;
  type: string;
  storeId: string | undefined;
}

// For API routes (Node.js runtime)
export const generateToken = (user: IUser, storeId: string | undefined): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    username: user.username,
    type: user.type,
    storeId,
  };

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

// For API routes (Node.js runtime)
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

// For Edge Runtime (middleware) - using jose library
const secret = new TextEncoder().encode(JWT_SECRET);

export const generateTokenEdge = async (user: IUser): Promise<string> => {
  const payload: JWTPayload | any = {
    userId: user._id.toString(),
    username: user.username,
    type: user.type,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
};

export const verifyTokenEdge = async (
  token: string
): Promise<JWTPayload | null> => {
  try {
    const { payload }: any = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Helper function to extract user info from middleware headers
export function getUserFromRequest(request: Request) {
  return {
    userId: request.headers.get("x-user-id"),
    type: request.headers.get("x-user-type"),
    username: request.headers.get("x-username"),
  };
}
