import { auth } from "@/lib/auth";
import { findAllNotesWithUser } from "@/services/notes";
import type { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/notes - Get all notes with user information (admin only)
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
    const userId = searchParams.get("userId") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Fetch notes with pagination
    const { notes, total } = await findAllNotesWithUser({
      userId,
      page,
      limit,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        notes,
        total,
        page,
        limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin notes:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch notes",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
