"use client";

import { Routes } from "@/constants/router";
import { useGetNotesQuery } from "@/lib/store/api/notes/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: notes, isLoading } = useGetNotesQuery();
  const router = useRouter();

  // If user has notes, redirect to the most recent one
  useEffect(() => {
    if (!isLoading && notes && notes.length > 0) {
      router.push(Routes.getNoteRoute(notes[0].id as string));
    }
  }, [notes, isLoading, router]);

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
        <Link
          href={Routes.NEW_NOTE}
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
        >
          Create Your First Note
        </Link>
      </div>
    </div>
  );
}
