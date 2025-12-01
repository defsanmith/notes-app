import { auth } from "@/lib/auth";
import { findNoteById, updateNote, deleteNote } from "@/services/notes";
import type { ApiResponse } from "@/types/api";
import type { Prisma } from "@/generated/prisma";
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

// GET /api/notes/[noteId] - Get a specific note
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

    const { noteId } = await params;

    const note = await findNoteById(noteId);

    if (!note) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Note not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify the note belongs to the authenticated user
    if (note.userId !== session.user.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const response: ApiResponse<Note> = {
      success: true,
      data: note,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching note:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to fetch note",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PATCH /api/notes/[noteId] - Update a note
export async function PATCH(
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

    const { noteId } = await params;
    const body = await request.json();
    const { title, content } = body;

    // First, verify the note exists and belongs to the user
    const existingNote = await findNoteById(noteId);

    if (!existingNote) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Note not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (existingNote.userId !== session.user.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Build update data object with only provided fields
    const updateData: { title?: string; content?: Prisma.InputJsonValue } = {};
    
    if (title !== undefined) {
      if (typeof title !== "string") {
        const errorResponse: ApiResponse = {
          success: false,
          error: "Title must be a string",
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      updateData.content = content as Prisma.InputJsonValue;
    }

    // Update the note
    const updatedNote = await updateNote(noteId, updateData);

    const response: ApiResponse<Note> = {
      success: true,
      data: updatedNote,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating note:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to update note",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE /api/notes/[noteId] - Delete a note
export async function DELETE(
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

    const { noteId } = await params;

    // First, verify the note exists and belongs to the user
    const existingNote = await findNoteById(noteId);

    if (!existingNote) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Note not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (existingNote.userId !== session.user.id) {
      const errorResponse: ApiResponse = {
        success: false,
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Delete the note
    await deleteNote(noteId);

    const response: ApiResponse = {
      success: true,
      data: { message: "Note deleted successfully" },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting note:", error);

    const errorResponse: ApiResponse = {
      success: false,
      error: "Failed to delete note",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

