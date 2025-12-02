import { auth } from "@/lib/auth";
import { findNoteById } from "@/services/notes";
import type { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/notes/[noteId] - Get a specific note (admin only, read-only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
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

    const { noteId } = await params;

    const note = await findNoteById(noteId);

    if (!note) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Note not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: note,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin note:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch note",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
