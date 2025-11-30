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

  // User is authenticated, allow access
  return NextResponse.next();
}

// Export as middleware for Next.js convention
export default proxy;
