"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

interface NavUserProps extends React.ComponentProps<typeof SidebarMenu> {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export default function NavUser({ user, ...props }: NavUserProps) {
  const { isMobile } = useSidebar();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  if (!user) {
    return null;
  }

  return (
    <SidebarMenu {...props}>
      <SidebarMenuItem>
        <div className="flex items-center gap-1 group/note-item">
          <SidebarMenuButton asChild className="flex-1">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.name || "User"}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email || ""}
              </span>
            </div>
          </SidebarMenuButton>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover/note-item:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            onClick={handleSignOut}
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
