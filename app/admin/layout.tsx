import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProviders } from "@/components/admin/AdminProviders";
import { requireAdmin } from "@/lib/auth/is-admin";

export const metadata: Metadata = {
  title: "Admin — Preppy Losers",
  description: "Preppy Losers admin dashboard.",
};

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin("/admin");

  const adminEmail = user.email?.trim() || "";

  return (
    <AdminProviders>
      <AdminLayout
        adminName={profile.full_name || "Admin"}
        adminEmail={adminEmail}
      >
        {children}
      </AdminLayout>
    </AdminProviders>
  );
}
