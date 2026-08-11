import type { ReactNode } from "react";
import { AdminLayout } from "@/components/auth/admin-layout";
import { AdminSidebar } from "@/components/admin/admin-nav";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayout>
      {/*
        The global <main> already has flex-1. This wrapper turns the admin
        shell into a side-by-side layout that fills the remaining viewport
        height without the top Navbar. The sidebar is sticky so it does
        not scroll away; the content area scrolls independently.
      */}
      <div className="flex min-h-[calc(100vh-57px)]">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </AdminLayout>
  );
}