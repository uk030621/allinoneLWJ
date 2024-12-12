//middleware.js
import { NextResponse } from "next/server";

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard",
    "/activities",
    "/api/:path*", // Match all API routes initially
  ],
};

// Middleware function to skip authentication for specific routes
export function middleware(req) {
  const url = req.nextUrl.pathname;

  // Public routes that should bypass authentication
  const publicRoutes = ["/api/register", "/api/userExists"];

  // Skip authentication for public routes
  if (publicRoutes.includes(url)) {
    return NextResponse.next();
  }

  // For all other routes, apply NextAuth middleware
  return NextResponse.next();
}
