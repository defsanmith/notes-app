import { auth } from "@/lib/auth";
import { findAllUsersWithPagination } from "@/services/auth";
import type { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users - Get all users with pagination (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Forbidden - Admin access required",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Fetch users with pagination
    const { users, total } = await findAllUsersWithPagination({
      search,
      page,
      limit,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        users,
        total,
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin users:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch users",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
