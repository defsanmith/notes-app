import { Routes } from "@/constants/router";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Configure middleware to run on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Public routes that don't require authentication
const publicRoutes = [
  Routes.SIGN_IN,
  Routes.SIGN_UP,
  "/api/auth",
  "/api/signup",
];

// Check if a path is public (doesn't require authentication)
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

// Check if a path is an API route
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

// Check if a path requires admin access
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const session = await auth();

  // If user is not authenticated
  if (!session?.user) {
    // For API routes, return 401 JSON response
    if (isApiRoute(pathname)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };

      return NextResponse.json(errorResponse, { status: 401 });
    }

    // For page routes, redirect to signin
    const signInUrl = new URL(Routes.SIGN_IN, request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If admin user is accessing home route, redirect to admin panel
  if (session.user.role === "ADMIN" && pathname === Routes.HOME) {
    const adminUrl = new URL(Routes.ADMIN, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Check if route requires admin access
  if (isAdminRoute(pathname)) {
    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      // For API routes, return 403 JSON response
      if (isApiRoute(pathname)) {
        const errorResponse: ApiResponse = {
          success: false,
          error: "Forbidden - Admin access required",
        };

        return NextResponse.json(errorResponse, { status: 403 });
      }

      // For page routes, redirect to home
      const homeUrl = new URL(Routes.HOME, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // User is authenticated (and is admin if accessing admin routes), allow access
  return NextResponse.next();
}

// Export as middleware for Next.js convention
export default proxy;
