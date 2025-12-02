"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditor } from "@/components/views/notes/note-editor";
import { useGetAdminNoteQuery } from "@/lib/store/api/admin/queries";
import { JSONContent } from "novel";
import { use } from "react";

interface PageProps {
  params: Promise<{
    noteId: string;
  }>;
}

export default function AdminNotePage({ params }: PageProps) {
  const { noteId } = use(params);
  const { data, isLoading, error } = useGetAdminNoteQuery(noteId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center gap-4 border-b px-6 py-4">
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Note
          </h2>
          <p className="text-sm text-muted-foreground">
            {error ? "Failed to load note" : "Note not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <NoteEditor
      noteId={noteId}
      initialTitle={data.title}
      initialContent={data.content as JSONContent}
      editable={false}
    />
  );
}
