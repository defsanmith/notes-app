"use client";

import { NoteEditor } from "@/components/views/notes/note-editor";
import { Routes } from "@/constants/router";
import {
  useCreateNoteMutation,
  useGetNoteQuery,
} from "@/lib/store/api/notes/queries";
import { useParams, useRouter } from "next/navigation";
import type { JSONContent } from "novel";
import * as React from "react";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;
  const isNewNote = noteId === "new";

  const [createNote] = useCreateNoteMutation();
  const [isCreating, setIsCreating] = React.useState(false);
  const [localNoteId, setLocalNoteId] = React.useState<string | null>(
    isNewNote ? null : noteId
  );

  // Only fetch note if it's not a new note
  const { data: note, isLoading } = useGetNoteQuery(noteId, {
    skip: isNewNote,
  });

  // Handle creating a new note on first edit
  const handleCreateNote = React.useCallback(
    async (title: string, content?: JSONContent) => {
      if (isCreating || localNoteId) return;

      setIsCreating(true);
      try {
        const newNote = await createNote({
          title: title || "Untitled",
          content,
        }).unwrap();

        setLocalNoteId(newNote.id);
        // Update the URL to the new note ID
        router.replace(Routes.getNoteRoute(newNote.id as string));
      } catch (error) {
        console.error("Failed to create note:", error);
        setIsCreating(false);
      }
    },
    [createNote, isCreating, localNoteId, router]
  );

  // Handle content change for new notes
  const handleContentChange = React.useCallback(
    (content: JSONContent) => {
      if (isNewNote && !localNoteId && !isCreating) {
        handleCreateNote("Untitled", content);
      }
    },
    [isNewNote, localNoteId, isCreating, handleCreateNote]
  );

  // Handle title change for new notes
  const handleTitleChange = React.useCallback(
    (title: string) => {
      if (isNewNote && !localNoteId && !isCreating) {
        handleCreateNote(title);
      }
    },
    [isNewNote, localNoteId, isCreating, handleCreateNote]
  );

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    );
  }

  // For new notes that haven't been created yet
  if (isNewNote && !localNoteId) {
    return (
      <NoteEditor
        noteId="new"
        initialTitle="Untitled"
        onContentChange={handleContentChange}
        onTitleChange={handleTitleChange}
      />
    );
  }

  // For existing notes or newly created notes
  const currentNoteId = localNoteId || noteId;
  const currentNote = note;

  if (!isNewNote && !currentNote) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Note not found</div>
      </div>
    );
  }

  // Prepare initial content - ensure it has proper structure
  let initialContent: JSONContent | undefined;
  if (currentNote?.content && typeof currentNote.content === "object") {
    initialContent = currentNote.content as JSONContent;
  }

  return (
    <NoteEditor
      noteId={currentNoteId}
      initialTitle={currentNote?.title || "Untitled"}
      initialContent={initialContent}
    />
  );
}
