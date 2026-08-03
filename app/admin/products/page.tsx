import { ProductTable } from "@/components/admin/ProductTable";
import { fetchAdminProducts } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/auth";

interface ProductsPageProps {
  searchParams?: { q?: string };
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin("/admin/products");
  const products = await fetchAdminProducts();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Catalog</p>
          <h1>Products</h1>
        </div>
      </div>
      <ProductTable products={products} initialQuery={searchParams?.q ?? ""} />
    </div>
  );
}
