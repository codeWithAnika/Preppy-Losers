"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Box,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/drops", label: "Drops", icon: Zap },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

interface AdminSidebarProps {
  pathname: string;
}

export function AdminSidebar({ pathname }: AdminSidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const nav = (
    <>
      <div className="admin-sidebar__brand">
        <Image
          src="/logo-badge.webp"
          alt="Preppy Losers"
          width={28}
          height={28}
          className="rounded-full"
        />
        <div>
          <p className="admin-sidebar__title">Preppy Losers</p>
          <p className="admin-sidebar__subtitle">Admin</p>
        </div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`admin-sidebar__link ${active ? "is-active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar__footer">
        <Link href="/" className="admin-sidebar__link">
          <Box size={16} strokeWidth={1.75} />
          <span>View Store</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="admin-sidebar__link admin-sidebar__logout"
        >
          <LogOut size={16} strokeWidth={1.75} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        {nav}
      </aside>
      {mobileOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </>
  );
}
