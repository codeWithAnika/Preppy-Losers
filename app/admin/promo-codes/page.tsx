import type { Metadata } from "next";
import { PromoCodesManager } from "@/components/admin/PromoCodesManager";
import { fetchAdminPromoCodes } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Promo Codes — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPromoCodesPage() {
  const promoCodes = await fetchAdminPromoCodes();

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Commerce</p>
          <h1>Promo Codes</h1>
        </div>
      </header>

      <PromoCodesManager promoCodes={promoCodes} />
    </div>
  );
}
