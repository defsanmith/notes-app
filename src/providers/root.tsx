"use client";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Providers>
        {children}
        <Toaster />
      </Providers>
    </SessionProvider>
  );
}
