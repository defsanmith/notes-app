"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetNoteQuery } from "@/lib/store/api/notes/queries";
import { useParams, usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const params = useParams();
  const noteId = params?.noteId as string | undefined;

  // Only fetch note data if we're on a note page
  const isNotePage = pathname?.startsWith("/note/");
  const isNewNote = noteId === "new";

  const { data: note } = useGetNoteQuery(noteId || "", {
    skip: !isNotePage || !noteId || isNewNote,
  });

  // Determine title based on current page
  let title = "Notes";
  if (isNotePage) {
    if (isNewNote) {
      title = "New Note";
    } else if (note) {
      title = note.title || "Untitled";
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
