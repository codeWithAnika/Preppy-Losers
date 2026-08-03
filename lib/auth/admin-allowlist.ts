/** Supabase auth user UUIDs permitted to hold admin access. */
export const ADMIN_USER_IDS = [
  "57f4cd74-f557-491f-a283-89b1a7ccdf43", // Anika Simba
  "8dcc42bf-b7ea-4515-9c4c-767cef5160ac", // Nishant
] as const;

const ADMIN_USER_ID_SET = new Set<string>(ADMIN_USER_IDS);

export function isAdminAllowlisted(userId: string): boolean {
  return ADMIN_USER_ID_SET.has(userId);
}

/** True when user id is allowlisted and profiles.role is admin. */
export function isAdmin(
  userId: string,
  profileRole: string | null | undefined
): boolean {
  return isAdminAllowlisted(userId) && profileRole?.trim() === "admin";
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
