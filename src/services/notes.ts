import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";

/**
 * Note select fields to return from queries
 */
const noteSelect = {
  id: true,
  title: true,
  content: true,
  published: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
} as const;

/**
 * Find all notes for a specific user, ordered by most recently updated
 */
export async function findNotesByUserId(userId: string) {
  return prisma.notes.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: noteSelect,
  });
}

/**
 * Find a single note by ID
 */
export async function findNoteById(noteId: string) {
  return prisma.notes.findUnique({
    where: {
      id: noteId,
    },
    select: noteSelect,
  });
}

/**
 * Create a new note
 */
export async function createNote(data: {
  title: string;
  content?: Prisma.InputJsonValue;
  userId: string;
}) {
  return prisma.notes.create({
    data: {
      title: data.title,
      content: data.content ?? Prisma.JsonNull,
      userId: data.userId,
    },
    select: noteSelect,
  });
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: string,
  data: {
    title?: string;
    content?: Prisma.InputJsonValue;
  }
) {
  return prisma.notes.update({
    where: {
      id: noteId,
    },
    data,
    select: noteSelect,
  });
}

/**
 * Delete a note by ID
 */
export async function deleteNote(noteId: string) {
  return prisma.notes.delete({
    where: {
      id: noteId,
    },
    select: noteSelect,
  });
}

/**
 * Find all notes with user information (for admin)
 */
export async function findAllNotesWithUser(params: {
  userId?: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;

  const where: Prisma.NotesWhereInput = params.userId
    ? { userId: params.userId }
    : {};

  const [notes, total] = await Promise.all([
    prisma.notes.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        ...noteSelect,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.notes.count({ where }),
  ]);

  return { notes, total };
}
