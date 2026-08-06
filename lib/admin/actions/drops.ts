"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import { slugifyDropName } from "@/lib/drops";
import type { DropFormInput } from "@/lib/drops.types";
import { getNextDropNumber } from "@/lib/drops.server";

const REVALIDATE_PATHS = [
  "/admin/drops",
  "/admin/dashboard",
  "/admin/products",
  "/shop",
  "/",
] as const;

function revalidateDropPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
}

function dropPayload(input: DropFormInput) {
  return {
    drop_number: input.dropNumber,
    name: input.name.trim(),
    slug: input.slug.trim() || slugifyDropName(input.name),
    description: input.description.trim() || null,
    hero_image: input.heroImage.trim() || null,
    banner_image: input.bannerImage.trim() || null,
    launch_date: input.launchDate,
    is_active: input.isActive,
    status: input.status,
    seo_title: input.seoTitle.trim() || null,
    seo_description: input.seoDescription.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export async function createDropAction(input: DropFormInput) {
  const { supabase } = await assertAdminAction();
  const payload = dropPayload(input);

  const { data, error } = await supabase
    .from("drops")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const, id: data.id };
}

export async function updateDropAction(input: DropFormInput) {
  const { supabase } = await assertAdminAction();
  if (!input.id) return { success: false as const, error: "Missing drop id" };

  const payload = dropPayload(input);
  const { error } = await supabase
    .from("drops")
    .update(payload)
    .eq("id", input.id);

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const, id: input.id };
}

export async function activateDropAction(dropId: string) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("drops")
    .update({
      is_active: true,
      status: "published",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dropId);

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const };
}

export async function deactivateDropAction(dropId: string) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("drops")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dropId);

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const };
}

export async function archiveDropAction(dropId: string) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("drops")
    .update({
      is_active: false,
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dropId);

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const };
}

export async function deleteDropAction(dropId: string) {
  const { supabase } = await assertAdminAction();

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("drop_id", dropId);

  if (countError) {
    return { success: false as const, error: countError.message };
  }

  if ((count ?? 0) > 0) {
    return {
      success: false as const,
      error: "Remove or reassign products before deleting this drop.",
    };
  }

  const { error } = await supabase.from("drops").delete().eq("id", dropId);
  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const };
}

export async function assignProductToDropAction(productId: string, dropId: string) {
  const { supabase } = await assertAdminAction();

  const { data: drop, error: dropError } = await supabase
    .from("drops")
    .select("id, launch_date")
    .eq("id", dropId)
    .maybeSingle();

  if (dropError || !drop) {
    return { success: false as const, error: dropError?.message ?? "Drop not found" };
  }

  const { error } = await supabase
    .from("products")
    .update({
      drop_id: dropId,
      drop_date: drop.launch_date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { success: false as const, error: error.message };

  revalidateDropPaths();
  return { success: true as const };
}

export async function createDropWithDefaultsAction(name: string) {
  const dropNumber = await getNextDropNumber();
  const slug = slugifyDropName(name) || `drop-${String(dropNumber).padStart(2, "0")}`;

  return createDropAction({
    dropNumber,
    name,
    slug,
    description: "",
    heroImage: "",
    bannerImage: "",
    launchDate: new Date().toISOString().slice(0, 10),
    isActive: false,
    status: "draft",
    seoTitle: "",
    seoDescription: "",
  });
}
