"use client";

import { useState, useTransition } from "react";
import type { StoreSettings } from "@/lib/admin/types";
import { updateStoreSettingsAction } from "@/lib/admin/actions/settings";
import { useAdminToast } from "@/components/admin/AdminProviders";

interface SettingsFormProps {
  settings: StoreSettings;
}

export function SettingsForm({ settings: initial }: SettingsFormProps) {
  const { toast } = useAdminToast();
  const [settings, setSettings] = useState(initial);
  const [pending, startTransition] = useTransition();

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateStoreSettingsAction(settings);
      if (result.success) toast("Settings saved", "success");
      else toast(result.error, "error");
    });
  };

  return (
    <div className="admin-panel admin-settings">
      <div className="admin-form-section">
        <h2>Store</h2>
        <label className="admin-field">
          <span>Store name</span>
          <input
            className="admin-input"
            value={settings.storeName}
            onChange={(event) => update("storeName", event.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Support email</span>
          <input
            className="admin-input"
            type="email"
            value={settings.supportEmail}
            onChange={(event) => update("supportEmail", event.target.value)}
          />
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Shipping & tax</h2>
        <label className="admin-field">
          <span>Shipping note</span>
          <textarea
            className="admin-textarea"
            rows={3}
            value={settings.shippingNote}
            onChange={(event) => update("shippingNote", event.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Tax rate (%)</span>
          <input
            className="admin-input"
            type="number"
            min={0}
            step="0.1"
            value={settings.taxRate}
            onChange={(event) => update("taxRate", Number(event.target.value) || 0)}
          />
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Social links</h2>
        <label className="admin-field">
          <span>Instagram</span>
          <input
            className="admin-input"
            value={settings.socialLinks.instagram ?? ""}
            onChange={(event) =>
              update("socialLinks", {
                ...settings.socialLinks,
                instagram: event.target.value,
              })
            }
          />
        </label>
        <label className="admin-field">
          <span>Threads</span>
          <input
            className="admin-input"
            value={settings.socialLinks.threads ?? ""}
            onChange={(event) =>
              update("socialLinks", {
                ...settings.socialLinks,
                threads: event.target.value,
              })
            }
          />
        </label>
      </div>

      <div className="admin-form-section">
        <h2>Brand assets</h2>
        <label className="admin-field">
          <span>Logo URL</span>
          <input
            className="admin-input"
            value={settings.logoUrl}
            onChange={(event) => update("logoUrl", event.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Favicon URL</span>
          <input
            className="admin-input"
            value={settings.faviconUrl}
            onChange={(event) => update("faviconUrl", event.target.value)}
          />
        </label>
      </div>

      <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={save}>
        {pending ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
