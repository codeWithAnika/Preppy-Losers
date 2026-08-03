/** Path where users complete required profile fields after OAuth signup. */
export const PROFILE_COMPLETION_PATH = "/account/complete-profile";

export interface ProfileFields {
  full_name?: string | null;
}

/** True when full name is present and valid. */
export function isProfileComplete(profile: ProfileFields | null): boolean {
  if (!profile) return false;

  const name = profile.full_name?.trim() ?? "";
  return name.length >= 2;
}

/** Paths that do not require a completed profile (auth flows + completion page). */
export function isProfileCompletionExemptPath(pathname: string): boolean {
  return (
    pathname === PROFILE_COMPLETION_PATH ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/")
  );
}
