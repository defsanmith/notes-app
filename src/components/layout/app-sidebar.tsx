"use client";

import {
  IconCirclePlusFilled,
  IconInnerShadowTop,
  IconNote,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/constants/router";
import {
  useCreateNoteMutation,
  useGetNotesQuery,
} from "@/lib/store/api/notes/queries";

function formatNoteTitle(
  title: string,
  createdAt: Date | string,
  updatedAt: Date | string
): string {
  // If title is "Untitled", add a date suffix
  if (title === "Untitled" || title.trim() === "") {
    const date = new Date(updatedAt);
    return `Untitled - ${date.toLocaleDateString()}`;
  }
  return title;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: notes, isLoading } = useGetNotesQuery();
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();

  const handleNewNote = async () => {
    try {
      const newNote = await createNote({
        title: "Untitled",
      }).unwrap();
      router.push(Routes.getNoteRoute(newNote.id));
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={Routes.HOME}>
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Notes App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  onClick={handleNewNote}
                  disabled={isCreating}
                  tooltip="New Note"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>{isCreating ? "Creating..." : "New Note"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Notes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                // Loading skeleton
                <>
                  {[...Array(3)].map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <Skeleton className="h-10 w-full" />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : notes && notes.length > 0 ? (
                // Notes list
                notes.map((note) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === Routes.getNoteRoute(note.id)}
                      tooltip={formatNoteTitle(
                        note.title,
                        note.createdAt,
                        note.updatedAt
                      )}
                    >
                      <Link href={Routes.getNoteRoute(note.id)}>
                        <IconNote className="size-4!" />
                        <span className="truncate">
                          {formatNoteTitle(
                            note.title,
                            note.createdAt,
                            note.updatedAt
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                // Empty state
                <SidebarMenuItem>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No notes yet. Create one to get started!
                  </div>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
