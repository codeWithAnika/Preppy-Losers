import { SettingsForm } from "@/components/admin/SettingsForm";
import { fetchStoreSettings } from "@/lib/admin/queries";

export default async function AdminSettingsPage() {
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
