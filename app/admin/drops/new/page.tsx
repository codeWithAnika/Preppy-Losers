import { DropEditor } from "@/components/admin/DropEditor";
import { getNextDropNumber } from "@/lib/drops.server";

export default async function AdminNewDropPage() {
  const suggestedDropNumber = await getNextDropNumber();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Releases</p>
          <h1>Create drop</h1>
        </div>
      </div>
      <DropEditor suggestedDropNumber={suggestedDropNumber} />
    </div>
  );
}
