import { auth } from "@/lib/auth";
import { createNote, findNotesByUserId } from "@/services/notes";
import type { ApiResponse } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

interface Note {
  id: string;
  title: string;
  content: unknown;
  published: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// GET /api/notes - List all notes for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const notes = await findNotesByUserId(session.user.id);

    const response: ApiResponse<Note[]> = {
      success: true,
      data: notes,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching notes:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch notes",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Validate title is provided
    if (!title || typeof title !== "string") {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Title is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const note = await createNote({
      title: title.trim(),
      content: content || undefined,
      userId: session.user.id,
    });

    const response: ApiResponse<Note> = {
      success: true,
      data: note,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to create note",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

