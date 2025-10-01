import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Define your JWT secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable");
}

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

// Define excluded paths that don't need protection
const EXCLUDED_API_PATHS = [
  "/api/auth/onboard",
  "/api/auth/signin",
  "/api/common",
];

// Define role-based protected paths
const ADMIN_ONLY_PATHS = ["/api/admin"];
const OWNER_ONLY_PATHS = ["/api/owner"];

interface JWTPayload {
  userId: string;
  username: string;
  type: string;
  exp: number;
  iat: number;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload }: any = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_API_PATHS.some((excludedPath) => {
    if (excludedPath.endsWith("*")) {
      // Handle wildcard paths like /api/common*
      const basePath = excludedPath.slice(0, -1);
      return pathname.startsWith(basePath);
    }
    return pathname === excludedPath || pathname.startsWith(excludedPath + "/");
  });
}

function requiresAdminRole(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some((adminPath) => pathname.startsWith(adminPath));
}

function requiresOwnerRole(pathname: string): boolean {
  return OWNER_ONLY_PATHS.some((ownerPath) => pathname.startsWith(ownerPath));
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
      success: false,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Check if the path is a panel route (protected frontend route)
function isPanelRoute(pathname: string): boolean {
  // Pattern: /{username}/panel or /{username}/panel/anything
  const panelRegex = /^\/[^\/]+\/panel(?:\/.*)?$/;
  return panelRegex.test(pathname);
}

// Extract username from panel route
function extractUsernameFromPanelRoute(pathname: string): string | null {
  const match = pathname.match(/^\/([^\/]+)\/panel/);
  return match ? match[1] : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    console.log(`Processing API request: ${pathname}`);

    // Check if path is excluded from protection
    if (isExcludedPath(pathname)) {
      console.log(`Path ${pathname} is excluded from protection`);
      return NextResponse.next();
    }

    // Extract token from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      console.log("No Authorization header found");
      return createErrorResponse("Authorization header is required", 401);
    }

    // Extract token (Bearer token format)
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      console.log("No token found in Authorization header");
      return createErrorResponse("Token is required", 401);
    }

    // Verify the token
    const payload = await verifyToken(token);

    if (!payload) {
      console.log("Token verification failed");
      return createErrorResponse("Invalid or expired token", 401);
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token has expired");
      return createErrorResponse("Token has expired", 401);
    }

    // Role-based access control using 'type' field
    if (requiresAdminRole(pathname)) {
      if (payload.type !== "admin") {
        console.log(
          `Access denied: User type ${payload.type} cannot access admin path ${pathname}`
        );
        return createErrorResponse("Admin access required", 403);
      }
      console.log(`Admin access granted for ${pathname}`);
    }

    if (requiresOwnerRole(pathname)) {
      if (payload.type !== "owner") {
        console.log(
          `Access denied: User type ${payload.type} cannot access owner path ${pathname}`
        );
        return createErrorResponse("Owner access required", 403);
      }
      console.log(`Owner access granted for ${pathname}`);
    }

    // Add user info to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-type", payload.type);
    requestHeaders.set("x-username", payload.username);

    console.log(
      `Access granted for user ${payload.userId} with type ${payload.type}`
    );

    // Continue to the API route with user info in headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Handle Panel Routes (Frontend Protection)
  if (isPanelRoute(pathname)) {
    console.log(`Processing panel route: ${pathname}`);

    // Extract token from cookies (since we can't access localStorage in middleware)
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("No token found in cookies for panel access");
      // Redirect to signin page
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Verify the token
    const payload = await verifyToken(token);

    if (!payload) {
      console.log("Token verification failed for panel access");
      // Redirect to signin page
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log("Token has expired for panel access");
      // Redirect to signin page
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Extract username from the route
    const routeUsername = extractUsernameFromPanelRoute(pathname);

    if (!routeUsername) {
      console.log("Could not extract username from panel route");
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Verify that the user can access this specific store's panel
    if (payload.username !== routeUsername) {
      console.log(
        `User ${payload.username} trying to access ${routeUsername}'s panel`
      );
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    console.log(
      `Panel access granted for user ${payload.username} with type ${payload.type}`
    );

    // Set user info in headers for the panel pages to use
    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-type", payload.type);
    response.headers.set("x-username", payload.username);

    return response;
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all API routes and panel routes except:
     * - Static files (_next/static)
     * - Image optimization files (_next/image)
     * - Favicon, etc.
     */
    "/api/admin/:path*",
    "/api/owner/:path*",
    "/api/upload-images/:path*",
    // Panel routes pattern: /{username}/panel and /{username}/panel/*
    "/((?!_next/static|_next/image|favicon.ico).*)/panel",
    "/((?!_next/static|_next/image|favicon.ico).*)/panel/:path*",
  ],
};
