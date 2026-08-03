import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  resolveAdminAuthorization,
  type AdminAuthorization,
} from "@/lib/auth/is-admin";

export type AdminRoleCheck = AdminAuthorization;

export {
  isAdmin,
  isAdminAllowlisted,
  isAdminPath,
} from "@/lib/auth/admin-allowlist";

/** Read allowlist + profiles.role for the signed-in user (server-only). */
export async function readAdminRoleCheck(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AdminRoleCheck> {
  return resolveAdminAuthorization(supabase, userId);
}
