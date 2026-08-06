import { DropManager } from "@/components/admin/DropManager";
import {
  buildDropGroups,
  fetchAdminDrops,
  fetchAdminProducts,
} from "@/lib/admin/queries";

export default async function AdminDropsPage() {
  const [drops, products] = await Promise.all([
    fetchAdminDrops(),
    fetchAdminProducts(),
  ]);
  const dropGroups = buildDropGroups(drops, products);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Releases</p>
          <h1>Drops</h1>
        </div>
      </div>
      <DropManager dropGroups={dropGroups} />
    </div>
  );
}
