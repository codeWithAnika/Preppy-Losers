import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/profile";

const PROFILE_COLUMNS =
  "id, full_name, phone, role, created_at" as const;

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}
