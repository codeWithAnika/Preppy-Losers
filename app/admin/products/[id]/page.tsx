import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { fetchAdminDrops, fetchAdminProduct } from "@/lib/admin/queries";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, drops] = await Promise.all([
    fetchAdminProduct(params.id),
    fetchAdminDrops(),
  ]);
  if (!product) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Catalog</p>
          <h1>{product.name}</h1>
        </div>
      </div>
      <ProductEditor product={product} drops={drops} />
    </div>
  );
}
