import { ProductEditor } from "@/components/admin/ProductEditor";
import { fetchAdminDrops } from "@/lib/admin/queries";

export default async function NewProductPage() {
  const drops = await fetchAdminDrops();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Catalog</p>
          <h1>New product</h1>
          <p className="admin-muted">
            Create a product and assign it to a drop collection. Drop visibility is managed on
            the Drops page; publish the product when it is ready to sell.
          </p>
        </div>
      </div>
      <ProductEditor drops={drops} />
    </div>
  );
}
