"use client";

import { Button } from "@/components/ui/button";
import { Routes } from "@/constants/router";
import {
  useCreateNoteMutation,
  useGetNotesQuery,
} from "@/lib/store/api/notes/queries";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: notes, isLoading } = useGetNotesQuery();
  const router = useRouter();
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();

  // If user has notes, redirect to the most recent one
  useEffect(() => {
    if (!isLoading && notes && notes.length > 0) {
      router.push(Routes.getNoteRoute(notes[0].id as string));
    }
  }, [notes, isLoading, router]);

  const handleCreateFirstNote = async () => {
    try {
      const newNote = await createNote({
        title: "Untitled",
      }).unwrap();
      router.push(Routes.getNoteRoute(newNote.id));
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If user has no notes, show welcome screen
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold">Welcome to Notes App</h1>
        <p className="text-muted-foreground">
          You don&apos;t have any notes yet. Create your first note to get
          started!
        </p>
        <Button
          onClick={handleCreateFirstNote}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Your First Note"}
        </Button>
      </div>
    </div>
  );
}
