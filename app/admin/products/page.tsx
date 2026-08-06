import { ProductTable } from "@/components/admin/ProductTable";
import { fetchAdminDrops, fetchAdminProducts } from "@/lib/admin/queries";

interface ProductsPageProps {
  searchParams?: { q?: string };
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const [products, drops] = await Promise.all([
    fetchAdminProducts(),
    fetchAdminDrops(),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Catalog</p>
          <h1>Products</h1>
        </div>
      </div>
      <ProductTable
        products={products}
        drops={drops}
        initialQuery={searchParams?.q ?? ""}
      />
    </div>
  );
}
