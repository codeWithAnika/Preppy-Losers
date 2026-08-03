"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import type { StoreSettings } from "@/lib/admin/types";

export async function updateStoreSettingsAction(settings: StoreSettings) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase.from("store_settings").upsert({
    id: 1,
    settings,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true as const };
}

export async function deleteMediaFileAction(path: string) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase.storage.from("product-media").remove([path]);
  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/media");
  return { success: true as const };
}

export async function renameMediaFileAction(fromPath: string, toPath: string) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase.storage
    .from("product-media")
    .move(fromPath, toPath);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/media");
  return { success: true as const };
}
