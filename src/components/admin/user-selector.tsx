"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Routes } from "@/constants/router";
import { useGetUsersQuery } from "@/lib/store/api/admin/queries";
import { cn } from "@/lib/utils";
import { IconCheck, IconChevronDown, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import * as React from "react";
import { useDebouncedCallback } from "use-debounce";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface UserSelectorProps {
  selectedUserId: string | null;
  onUserSelect: (userId: string | null) => void;
}

export function UserSelector({
  selectedUserId,
  onUserSelect,
}: UserSelectorProps) {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);

  const limit = 20;

  // Debounced search update
  const updateDebouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
    setAllUsers([]);
  }, 300);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  // Accumulate users as pages load
  React.useEffect(() => {
    if (data?.users) {
      setAllUsers((prev) => {
        const newUsers = data.users.filter(
          (user) => !prev.find((p) => p.id === user.id)
        );
        return [...prev, ...newUsers];
      });
    }
  }, [data]);

  // Reset accumulated users when search changes
  React.useEffect(() => {
    if (page === 1 && data?.users) {
      setAllUsers(data.users);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const selectedUser = allUsers.find((u) => u.id === selectedUserId);
  const hasMore = data ? allUsers.length < data.total : false;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateDebouncedSearch(value);
  };

  const handleSelect = (userId: string) => {
    onUserSelect(userId === selectedUserId ? null : userId);
    setOpen(false);
    setSearch("");
    setDebouncedSearch("");
    router.push(Routes.ADMIN);
  };

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <IconUser className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedUser
                ? selectedUser.name || selectedUser.email
                : "All Users"}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <IconChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search users..."
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading || isFetching ? "Loading..." : "No users found"}
            </CommandEmpty>
            <CommandGroup>
              {/* All Users option */}
              <CommandItem
                value="all"
                onSelect={() => {
                  onUserSelect(null);
                  setOpen(false);
                  router.push(Routes.ADMIN);
                }}
                className="cursor-pointer"
              >
                <IconCheck
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedUserId ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">All Users</span>
                  <span className="text-xs text-muted-foreground">
                    View notes from all users
                  </span>
                </div>
              </CommandItem>

              {/* User list */}
              {allUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => handleSelect(user.id)}
                  className="cursor-pointer"
                >
                  <IconCheck
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">
                      {user.name || user.email}
                    </span>
                    {user.name && (
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}

              {/* Load more button */}
              {hasMore && (
                <CommandItem
                  onSelect={loadMore}
                  className="justify-center cursor-pointer text-muted-foreground"
                  disabled={isFetching}
                >
                  {isFetching ? "Loading..." : "Load more..."}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
