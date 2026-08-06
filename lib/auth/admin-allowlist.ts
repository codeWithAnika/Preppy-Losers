/** True when allowlisted and profiles.role is admin. */
export function isAdminAuthorized(
  profileRole: string | null | undefined,
  allowlisted: boolean
): boolean {
  return allowlisted && profileRole?.trim() === "admin";
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
