"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminProductRow, ProductFormInput, ProductStatus } from "@/lib/admin/types";
import { slugify } from "@/lib/admin/format";
import { DropSelector } from "@/components/admin/DropSelector";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { InventoryEditor } from "@/components/admin/InventoryEditor";
import { useAdminToast } from "@/components/admin/AdminProviders";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/admin/actions/products";

interface ProductEditorProps {
  product?: AdminProductRow | null;
  suggestedDropNumber?: number;
}

function toForm(
  product?: AdminProductRow | null,
  suggestedDropNumber = 1
): ProductFormInput {
  const isNew = !product?.id;
  return {
    id: product?.id,
    slug: product?.slug ?? product?.id ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    details: product?.details ?? "",
    price: product?.price ?? 0,
    dropNumber: product?.drop_number ?? suggestedDropNumber,
    dropDate: product?.drop_date ?? new Date().toISOString().slice(0, 10),
    category: product?.category ?? "Apparel",
    status: (product?.status ?? "draft") as ProductStatus,
    featured: product?.featured ?? false,
    isActive: product?.is_active ?? isNew,
    primaryImage: product?.primary_image ?? product?.images?.[0] ?? "",
    images: product?.images ?? [],
    sizeStock: product?.size_stock ?? [],
    weightGrams: product?.weight_grams ?? null,
    seoTitle: product?.seo_title ?? "",
    seoDescription: product?.seo_description ?? "",
    accentColor: product?.accent_color ?? "#8b1e1e",
  };
}

export function ProductEditor({ product, suggestedDropNumber }: ProductEditorProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [form, setForm] = useState<ProductFormInput>(() =>
    toForm(product, suggestedDropNumber)
  );
  const [preview, setPreview] = useState(false);
  const [pending, startTransition] = useTransition();

  const isEdit = !!product?.id;

  const update = <K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = (status: ProductStatus, publish = false) => {
    startTransition(async () => {
      const payload: ProductFormInput = {
        ...form,
        slug: form.slug || slugify(form.name),
        status: publish ? "published" : status,
        isActive: publish ? form.isActive : false,
      };

      const result = isEdit
        ? await updateProductAction(payload)
        : await createProductAction(payload);

      if (result.success) {
        toast(isEdit ? "Product saved" : "Product created", "success");
        router.push(`/admin/products/${result.id}`);
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  const previewCard = useMemo(
    () => (
      <div className="admin-preview-card">
        <div className="admin-preview-card__image">
          {form.primaryImage || form.images[0] ? (
            <Image
              src={form.primaryImage || form.images[0]}
              alt={form.name}
              fill
              className="object-cover"
              sizes="400px"
            />
          ) : null}
        </div>
        <div className="admin-preview-card__body">
          <p className="admin-preview-card__kicker">Drop {form.dropNumber}</p>
          <h3>{form.name || "Untitled product"}</h3>
          <p>{form.description || "Description preview"}</p>
          <p className="admin-preview-card__price">₹{form.price}</p>
        </div>
      </div>
    ),
    [form]
  );

  return (
    <div className="admin-editor-grid">
      <div className="admin-panel admin-editor-form">
        <div className="admin-form-section">
          <h2>Product details</h2>
          <label className="admin-field">
            <span>Product name</span>
            <input
              className="admin-input"
              value={form.name}
              onChange={(event) => {
                update("name", event.target.value);
                if (!isEdit) update("slug", slugify(event.target.value));
              }}
            />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input
              className="admin-input"
              value={form.slug}
              onChange={(event) => update("slug", slugify(event.target.value))}
            />
          </label>
          <label className="admin-field">
            <span>Price (INR)</span>
            <input
              className="admin-input"
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => update("price", Number(event.target.value) || 0)}
            />
          </label>
          <label className="admin-field">
            <span>Description</span>
            <textarea
              className="admin-textarea"
              rows={4}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Details</span>
            <textarea
              className="admin-textarea"
              rows={5}
              value={form.details}
              onChange={(event) => update("details", event.target.value)}
            />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>Drop & category</h2>
          <div className="admin-form-row">
            <label className="admin-field">
              <span>Drop number</span>
              <DropSelector
                value={form.dropNumber}
                onChange={(dropNumber) => update("dropNumber", dropNumber)}
                options={Array.from(
                  { length: Math.max(5, form.dropNumber, suggestedDropNumber ?? 1) },
                  (_, index) => index + 1
                )}
              />
            </label>
            <label className="admin-field">
              <span>Release date</span>
              <input
                className="admin-input"
                type="date"
                value={form.dropDate}
                onChange={(event) => update("dropDate", event.target.value)}
              />
            </label>
          </div>
          <label className="admin-field">
            <span>Category</span>
            <input
              className="admin-input"
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
            />
          </label>
          <div className="admin-form-row admin-form-row--checks">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
              />
              Featured
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
              />
              Active drop product
            </label>
          </div>
        </div>

        <div className="admin-form-section">
          <h2>Images</h2>
          <ImageUploader
            images={form.images}
            primaryImage={form.primaryImage}
            onChange={(images, primaryImage) => {
              update("images", images);
              update("primaryImage", primaryImage);
            }}
          />
        </div>

        <div className="admin-form-section">
          <h2>Sizes & stock</h2>
          <InventoryEditor
            value={form.sizeStock}
            onChange={(value) => update("sizeStock", value)}
          />
          <label className="admin-field">
            <span>Weight (grams)</span>
            <input
              className="admin-input"
              type="number"
              min={0}
              value={form.weightGrams ?? ""}
              onChange={(event) =>
                update(
                  "weightGrams",
                  event.target.value ? Number.parseInt(event.target.value, 10) : null
                )
              }
            />
          </label>
        </div>

        <div className="admin-form-section">
          <h2>SEO</h2>
          <label className="admin-field">
            <span>SEO title</span>
            <input
              className="admin-input"
              value={form.seoTitle}
              onChange={(event) => update("seoTitle", event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>SEO description</span>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.seoDescription}
              onChange={(event) => update("seoDescription", event.target.value)}
            />
          </label>
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? "Hide preview" : "Preview"}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={pending}
            onClick={() => save("draft")}
          >
            Save draft
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending}
            onClick={() => save("published", true)}
          >
            {pending ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      {preview ? <div className="admin-panel">{previewCard}</div> : null}
    </div>
  );
}
