import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { fetchAdminProduct } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/auth";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin(`/admin/products/${params.id}`);
  const product = await fetchAdminProduct(params.id);
  if (!product) notFound();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Catalog</p>
          <h1>{product.name}</h1>
        </div>
      </div>
      <ProductEditor product={product} />
    </div>
  );
}
