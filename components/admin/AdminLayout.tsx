"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
  adminName: string;
  adminEmail: string;
}

export function AdminLayout({
  children,
  adminName,
  adminEmail,
}: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <AdminSidebar pathname={pathname} />
      <div className="admin-main">
        <AdminNavbar adminName={adminName} adminEmail={adminEmail} />
        <div className="admin-content admin-page-enter">{children}</div>
      </div>
    </div>
  );
}
