"use client";

import { IconInnerShadowTop, IconNote } from "@tabler/icons-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Routes } from "@/constants/router";
import { useGetAdminNotesQuery } from "@/lib/store/api/admin/queries";
import { UserSelector } from "../admin/user-selector";
import NavUser from "./nav-user";

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

interface NoteWithUser {
  id: string;
  title: string;
  content: unknown;
  published: boolean;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

function formatNoteTitle(
  title: string,
  createdAt: Date | string,
  updatedAt: Date | string
): string {
  if (title === "Untitled" || title.trim() === "") {
    const date = new Date(updatedAt);
    return `Untitled - ${date.toLocaleDateString()}`;
  }
  return title;
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");
  const [page, setPage] = React.useState(1);
  const [allNotes, setAllNotes] = React.useState<NoteWithUser[]>([]);

  const limit = 50;

  const { data, isLoading, isFetching } = useGetAdminNotesQuery({
    userId: selectedUserId || undefined,
    page,
    limit,
  });

  // Reset accumulated notes when user filter changes
  React.useEffect(() => {
    setPage(1);
    setAllNotes([]);
  }, [selectedUserId]);

  // Handle data updates - replace or accumulate based on page
  React.useEffect(() => {
    if (data?.notes) {
      if (page === 1) {
        // For first page, replace all notes
        setAllNotes(data.notes);
      } else {
        // For subsequent pages, only add new notes
        setAllNotes((prev) => {
          const newNotes = data.notes.filter(
            (note) => !prev.find((p) => p.id === note.id)
          );
          return [...prev, ...newNotes];
        });
      }
    }
  }, [data, page]);

  const hasMore = data ? allNotes.length < data.total : false;

  // Container ref for virtualizer
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Virtualizer setup
  const virtualizer = useVirtualizer({
    count: allNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // Fixed height for each item
    overscan: 5,
  });

  // Infinite scroll - load more when near bottom
  React.useEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (!items.length) return;

    const lastItem = items[items.length - 1];
    if (
      lastItem &&
      lastItem.index >= allNotes.length - 5 &&
      hasMore &&
      !isFetching
    ) {
      setPage((p) => p + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNotes.length, hasMore, isFetching]);

  const filterLabel = selectedUserId ? "Filtered Notes" : "All Notes";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={Routes.ADMIN}>
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">
                  Notes App - Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* User Filter */}
        <SidebarGroup>
          <SidebarGroupLabel>Filter by User</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <UserSelector />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Notes List */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {filterLabel}
            {data && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({data.total})
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading && page === 1 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                Loading notes...
              </div>
            ) : allNotes.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                No notes found
              </div>
            ) : (
              <div
                ref={parentRef}
                className="h-[calc(100vh-15rem)] overflow-auto"
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <SidebarMenu>
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const note = allNotes[virtualRow.index];
                      if (!note) return null;

                      return (
                        <SidebarMenuItem
                          key={note.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <SidebarMenuButton
                            asChild
                            isActive={
                              pathname === Routes.getAdminNoteRoute(note.id)
                            }
                            tooltip={formatNoteTitle(
                              note.title,
                              note.createdAt,
                              note.updatedAt
                            )}
                          >
                            <Link
                              href={Routes.getAdminNoteRoute(note.id)}
                              className="flex items-center gap-2 w-full"
                            >
                              <IconNote className="size-4" />
                              <span className="truncate flex-1">
                                {formatNoteTitle(
                                  note.title,
                                  note.createdAt,
                                  note.updatedAt
                                )}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
                {/* Loading indicator */}
                {isFetching && page > 1 && (
                  <div className="px-2 py-2 text-center text-xs text-muted-foreground">
                    Loading more...
                  </div>
                )}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
