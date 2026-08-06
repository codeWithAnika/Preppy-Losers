import { notFound } from "next/navigation";
import { DropEditor } from "@/components/admin/DropEditor";
import { fetchAdminDrop } from "@/lib/admin/queries";
import { getNextDropNumber } from "@/lib/drops.server";

interface AdminEditDropPageProps {
  params: { id: string };
}

export default async function AdminEditDropPage({ params }: AdminEditDropPageProps) {
  const drop = await fetchAdminDrop(params.id);
  if (!drop) notFound();

  const suggestedDropNumber = await getNextDropNumber();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Releases</p>
          <h1>Edit drop</h1>
        </div>
      </div>
      <DropEditor drop={drop} suggestedDropNumber={suggestedDropNumber} />
    </div>
  );
}
