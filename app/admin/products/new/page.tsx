import { ProductEditor } from "@/components/admin/ProductEditor";
import { fetchAdminProducts } from "@/lib/admin/queries";

export default async function NewProductPage() {
  const products = await fetchAdminProducts();  const nextDropNumber =
    products.reduce((max, product) => Math.max(max, product.drop_number ?? 0), 0) + 1;

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Releases</p>
          <h1>Launch new drop</h1>
          <p className="admin-muted">
            Fill in details, upload images, set stock, then Publish with &ldquo;Active drop
            product&rdquo; checked. The previous live drop will be deactivated automatically.
          </p>
        </div>
      </div>
      <ProductEditor suggestedDropNumber={nextDropNumber} />
    </div>
  );
}
