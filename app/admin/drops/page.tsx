import { DropManager } from "@/components/admin/DropManager";
import { DropStockPanel } from "@/components/admin/InventoryEditor";
import { fetchAdminProducts, groupProductsByDrop } from "@/lib/admin/queries";

export default async function AdminDropsPage() {
  const products = await fetchAdminProducts();  const drops = groupProductsByDrop(products);
  const activeProduct = products.find((product) => product.is_active) ?? null;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Releases</p>
          <h1>Drops</h1>
        </div>
      </div>
      {activeProduct ? (
        <DropStockPanel
          productId={activeProduct.id}
          productName={activeProduct.name}
          sizeStock={activeProduct.size_stock ?? []}
        />
      ) : null}
      <DropManager drops={drops} />
    </div>
  );
}
