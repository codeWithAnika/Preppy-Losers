import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getProfile } from "@/lib/profile.server";
import type { Profile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  isAdmin,
  isAdminAllowlisted,
} from "@/lib/auth/admin-allowlist";

export {
  ADMIN_USER_IDS,
  isAdmin,
  isAdminAllowlisted,
} from "@/lib/auth/admin-allowlist";

export type AdminSession = {
  supabase: ReturnType<typeof createClient>;
  user: User;
  profile: Profile;
};

export type AdminAuthorization = {
  userId: string;
  allowlisted: boolean;
  role: string | null;
  profileFound: boolean;
  isAdmin: boolean;
};

function logAdminDev(message: string, payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[admin] ${message}`, payload);
  }
}

export async function resolveAdminAuthorization(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AdminAuthorization> {
  const allowlisted = isAdminAllowlisted(userId);

  logAdminDev("resolve authorization", { userId, allowlisted });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[admin] Failed to read profile role:", error.message, {
      code: error.code,
      userId,
    });
  }

  if (!profile || profile.id !== userId) {
    logAdminDev("profile missing or mismatched", {
      userId,
      error: error?.message,
    });
    return {
      userId,
      allowlisted,
      role: null,
      profileFound: false,
      isAdmin: false,
    };
  }

  const role = profile.role?.trim() ?? null;
  const authorized = isAdmin(userId, role);

  logAdminDev("authorization resolved", {
    userId,
    allowlisted,
    role,
    isAdmin: authorized,
  });

  return {
    userId,
    allowlisted,
    role,
    profileFound: true,
    isAdmin: authorized,
  };
}

export async function requireAdmin(
  nextPath = "/admin/dashboard"
): Promise<AdminSession> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const authorization = await resolveAdminAuthorization(supabase, user.id);

  if (!authorization.isAdmin) {
    logAdminDev("requireAdmin denied", {
      userId: user.id,
      allowlisted: authorization.allowlisted,
      role: authorization.role,
      profileFound: authorization.profileFound,
    });
    redirect("/account?admin_denied=1");
  }

  const profile = await getProfile(user.id);

  if (!profile || !isAdmin(user.id, profile.role)) {
    logAdminDev("requireAdmin profile re-check failed", { userId: user.id });
    redirect("/account?admin_denied=1");
  }

  logAdminDev("requireAdmin granted", {
    userId: user.id,
    role: profile.role,
  });

  return { supabase, user, profile };
}

export async function assertAdminAction(): Promise<AdminSession> {
  return requireAdmin();
}
