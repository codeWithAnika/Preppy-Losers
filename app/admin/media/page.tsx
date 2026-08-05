import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { fetchMediaLibrary } from "@/lib/admin/media.server";

export default async function AdminMediaPage() {
  const items = await fetchMediaLibrary();
  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Assets</p>
          <h1>Media</h1>
        </div>
      </div>
      <MediaLibrary items={items} />
    </div>
  );
}
