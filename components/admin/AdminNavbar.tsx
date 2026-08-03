"use client";

import { Bell, Search } from "lucide-react";
import { SearchBar } from "@/components/admin/SearchBar";
import { formatAdminDate } from "@/lib/admin/format";

interface AdminNavbarProps {
  adminName: string;
  adminEmail: string;
}

export function AdminNavbar({ adminName, adminEmail }: AdminNavbarProps) {
  const today = formatAdminDate(new Date().toISOString());

  return (
    <header className="admin-navbar">
      <div className="admin-navbar__left">
        <SearchBar placeholder="Search products, orders, customers…" />
      </div>
      <div className="admin-navbar__right">
        <span className="admin-navbar__date">{today}</span>
        <button type="button" className="admin-icon-btn" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.75} />
        </button>
        <div className="admin-profile">
          <div className="admin-profile__avatar" aria-hidden="true">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-profile__meta">
            <p>{adminName}</p>
            <span>{adminEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminNavbarCompactSearch() {
  return (
    <div className="admin-navbar__search-compact">
      <Search size={16} />
    </div>
  );
}
