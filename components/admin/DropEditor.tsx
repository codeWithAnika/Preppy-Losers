"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminDropRow } from "@/lib/admin/types";
import type { DropFormInput, DropStatus } from "@/lib/drops.types";
import { slugifyDropName } from "@/lib/drops";
import {
  createDropAction,
  updateDropAction,
} from "@/lib/admin/actions/drops";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface DropEditorProps {
  drop?: AdminDropRow | null;
  suggestedDropNumber: number;
}

function toForm(drop: AdminDropRow | null | undefined, suggestedDropNumber: number): DropFormInput {
  return {
    id: drop?.id,
    dropNumber: drop?.drop_number ?? suggestedDropNumber,
    name: drop?.name ?? "",
    slug: drop?.slug ?? "",
    description: drop?.description ?? "",
    heroImage: drop?.hero_image ?? "",
    bannerImage: drop?.banner_image ?? "",
    launchDate: drop?.launch_date ?? new Date().toISOString().slice(0, 10),
    isActive: drop?.is_active ?? false,
    status: (drop?.status ?? "draft") as DropStatus,
    seoTitle: drop?.seo_title ?? "",
    seoDescription: drop?.seo_description ?? "",
  };
}

export function DropEditor({ drop, suggestedDropNumber }: DropEditorProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [form, setForm] = useState<DropFormInput>(() => toForm(drop, suggestedDropNumber));
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(drop?.id);

  const update = <K extends keyof DropFormInput>(key: K, value: DropFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    startTransition(async () => {
      const payload: DropFormInput = {
        ...form,
        slug: form.slug.trim() || slugifyDropName(form.name),
      };

      const result = isEdit
        ? await updateDropAction(payload)
        : await createDropAction(payload);

      if (result.success) {
        toast(isEdit ? "Drop saved" : "Drop created", "success");
        router.push(`/admin/drops/${result.id}`);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="admin-panel admin-editor-form">
      <div className="admin-form-section">
        <h2>Drop details</h2>
        <label className="admin-field">
          <span>Drop name</span>
          <input
            className="admin-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>
        <label className="admin-field">
          <span>Slug (URL)</span>
          <input
            className="admin-input"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder={slugifyDropName(form.name) || "drop-slug"}
          />
        </label>
        <label className="admin-field">
          <span>Description</span>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>
        <div className="admin-form-row">
          <label className="admin-field">
            <span>Drop number</span>
            <input
              className="admin-input"
              type="number"
              min={1}
              value={form.dropNumber}
              onChange={(e) => update("dropNumber", Number.parseInt(e.target.value, 10) || 1)}
            />
          </label>
          <label className="admin-field">
            <span>Launch date</span>
            <input
              className="admin-input"
              type="date"
              value={form.launchDate}
              onChange={(e) => update("launchDate", e.target.value)}
            />
          </label>
        </div>
        <div className="admin-form-row">
          <label className="admin-field">
            <span>Status</span>
            <select
              className="admin-input"
              value={form.status}
              onChange={(e) => update("status", e.target.value as DropStatus)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-check admin-field">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
            />
            Active on shop
          </label>
        </div>
      </div>

      <div className="admin-form-section">
        <h2>Hero & banner</h2>
        <p className="admin-muted">Hero image</p>
        <ImageUploader
          images={form.heroImage ? [form.heroImage] : []}
          primaryImage={form.heroImage}
          onChange={(images, primary) => update("heroImage", primary || images[0] || "")}
        />
        <p className="admin-muted">Banner image</p>
        <ImageUploader
          images={form.bannerImage ? [form.bannerImage] : []}
          primaryImage={form.bannerImage}
          onChange={(images, primary) => update("bannerImage", primary || images[0] || "")}
        />
      </div>

      <div className="admin-form-section">
        <h2>SEO</h2>
        <label className="admin-field">
          <span>SEO title</span>
          <input
            className="admin-input"
            value={form.seoTitle}
            onChange={(e) => update("seoTitle", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>SEO description</span>
          <textarea
            className="admin-input admin-textarea"
            rows={3}
            value={form.seoDescription}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </label>
      </div>

      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={pending || !form.name.trim()}
          onClick={save}
        >
          {pending ? "Saving..." : isEdit ? "Save drop" : "Create drop"}
        </button>
      </div>
    </div>
  );
}
