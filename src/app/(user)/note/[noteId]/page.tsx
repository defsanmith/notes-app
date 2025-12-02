"use client";

import { NoteEditor } from "@/components/views/notes/note-editor";
import { useGetNoteQuery } from "@/lib/store/api/notes/queries";
import { useParams } from "next/navigation";
import type { JSONContent } from "novel";
import { useEffect } from "react";

export default function NotePage() {
  const params = useParams();
  const noteId = params.noteId as string;

  const { data: note, isLoading } = useGetNoteQuery(noteId);

  useEffect(() => {
    if (note?.title) {
      document.title = `${note.title} | Notes App`;
    }
  }, [note?.title]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Note not found</div>
      </div>
    );
  }

  // Prepare initial content - ensure it has proper structure
  let initialContent: JSONContent | undefined;
  if (note.content && typeof note.content === "object") {
    initialContent = note.content as JSONContent;
  }

  return (
    <NoteEditor
      noteId={noteId}
      initialTitle={note.title || "Untitled"}
      initialContent={initialContent}
    />
  );
}
