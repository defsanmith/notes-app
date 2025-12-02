import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
};

export default function AdminPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-muted-foreground mb-2">
          Admin Panel
        </h1>
        <p className="text-sm text-muted-foreground">
          Select a note from the sidebar to view
        </p>
      </div>
    </div>
  );
}
