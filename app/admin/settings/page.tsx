import { SettingsForm } from "@/components/admin/SettingsForm";
import { fetchStoreSettings } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");
  const settings = await fetchStoreSettings();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Configuration</p>
          <h1>Settings</h1>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
