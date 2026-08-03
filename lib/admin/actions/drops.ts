"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import { buildDefaultSizeStock } from "@/lib/products";

export async function activateDropAction(productId: string) {
  const { supabase } = await assertAdminAction();

  await supabase
    .from("products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("is_active", true);

  const { error } = await supabase
    .from("products")
    .update({
      is_active: true,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/drops");
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function deactivateDropAction(productId: string) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("products")
    .update({
      is_active: false,
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/drops");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function archiveDropProductsAction(dropNumber: number) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("products")
    .update({
      is_active: false,
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("drop_number", dropNumber);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/drops");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true as const };
}

export async function createDropAction(input: {
  dropNumber: number;
  title: string;
  releaseDate: string;
  heroProductId?: string;
}) {
  const { supabase } = await assertAdminAction();
  const id = `drop-${String(input.dropNumber).padStart(2, "0")}`;

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existing) {
    return { success: false as const, error: "Drop already exists for this number" };
  }

  const { error } = await supabase.from("products").insert({
    id,
    slug: id,
    name: input.title,
    description: "",
    price: 0,
    drop_number: input.dropNumber,
    drop_date: input.releaseDate,
    size_stock: buildDefaultSizeStock(),
    images: [],
    is_active: false,
    status: "draft",
    featured: false,
  });

  if (error) return { success: false as const, error: error.message };

  if (input.heroProductId) {
    await activateDropAction(input.heroProductId);
  }

  revalidatePath("/admin/drops");
  revalidatePath("/admin/products");
  return { success: true as const, id };
}
