"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import type { TablesUpdate } from "@/lib/database.types";
import type { ProductFormInput, ProductStatus } from "@/lib/admin/types";
import { slugify } from "@/lib/admin/format";
import { buildDefaultSizeStock } from "@/lib/products";
import type { SizeStock } from "@/lib/products";

function productPayload(input: ProductFormInput) {
  const images = input.images.length > 0 ? input.images : [];
  const primaryImage = input.primaryImage || images[0] || null;
  const sizeStock =
    input.sizeStock.length > 0 ? input.sizeStock : buildDefaultSizeStock();

  return {
    id: input.id ?? input.slug,
    slug: input.slug || slugify(input.name),
    name: input.name,
    description: input.description,
    details: input.details || null,
    price: Math.round(input.price),
    drop_number: input.dropNumber,
    drop_date: input.dropDate,
    size_stock: sizeStock,
    images,
    primary_image: primaryImage,
    is_active: input.isActive,
    featured: input.featured,
    category: input.category || null,
    weight_grams: input.weightGrams,
    seo_title: input.seoTitle || null,
    seo_description: input.seoDescription || null,
    status: input.status,
    accent_color: input.accentColor || null,
    updated_at: new Date().toISOString(),
  };
}

async function deactivateOtherActiveProducts(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createClient>,
  activeId: string
) {
  await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .neq("id", activeId)
    .eq("is_active", true);
}

export async function createProductAction(input: ProductFormInput) {
  const { supabase } = await assertAdminAction();
  const payload = productPayload(input);

  if (payload.is_active) {
    await deactivateOtherActiveProducts(supabase, payload.id);
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/drops");
  revalidatePath("/shop");
  return { success: true as const, id: payload.id };
}

export async function updateProductAction(input: ProductFormInput) {
  const { supabase } = await assertAdminAction();
  if (!input.id) return { success: false as const, error: "Missing product id" };

  const payload = productPayload({ ...input, id: input.id });

  if (payload.is_active) {
    await deactivateOtherActiveProducts(supabase, input.id);
  }

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", input.id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${input.id}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/drops");
  revalidatePath("/shop");
  return { success: true as const, id: input.id };
}

export async function deleteProductAction(id: string) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function duplicateProductAction(id: string) {
  const { supabase } = await assertAdminAction();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { success: false as const, error: error?.message ?? "Product not found" };
  }

  const newId = `${data.slug ?? data.id}-copy-${Date.now().toString(36)}`;
  const copy = {
    ...data,
    id: newId,
    slug: newId,
    name: `${data.name} (Copy)`,
    is_active: false,
    status: "draft" as ProductStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("products").insert(copy);
  if (insertError) return { success: false as const, error: insertError.message };

  revalidatePath("/admin/products");
  return { success: true as const, id: newId };
}

export async function archiveProductAction(id: string) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase
    .from("products")
    .update({
      status: "archived",
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function bulkUpdateProductStatusAction(
  ids: string[],
  status: ProductStatus
) {
  const { supabase } = await assertAdminAction();
  const payload: TablesUpdate<"products"> = {
    status,
    updated_at: new Date().toISOString(),
    ...(status !== "published" ? { is_active: false } : {}),
  };

  const { error } = await supabase.from("products").update(payload).in("id", ids);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function bulkDeleteProductsAction(ids: string[]) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function updateProductStockAction(
  productId: string,
  sizeStock: SizeStock[]
) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("products")
    .update({
      size_stock: sizeStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/drops");
  revalidatePath("/admin/dashboard");
  revalidatePath("/shop");
  return { success: true as const };
}
