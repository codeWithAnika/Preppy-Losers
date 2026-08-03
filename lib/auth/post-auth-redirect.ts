/** Default destination after sign-in when no return path is recorded. */
export const DEFAULT_POST_AUTH_REDIRECT = "/";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/auth"];

/** Reject open redirects and auth pages as post-login targets. */
export function sanitizePostAuthPath(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_POST_AUTH_REDIRECT;

  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  const pathname = path.split("?")[0]?.split("#")[0] ?? path;
  if (
    AUTH_PATH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return DEFAULT_POST_AUTH_REDIRECT;
  }

  return path;
}

/** Resolve return path from login/signup query params (`next` or `from`). */
export function resolvePostAuthPath(params: {
  next?: string | null;
  from?: string | null;
}): string {
  return sanitizePostAuthPath(params.next ?? params.from);
}

export function buildAuthPageHref(
  authPage: "/login" | "/signup",
  returnTo: string
): string {
  const next = sanitizePostAuthPath(returnTo);
  return `${authPage}?next=${encodeURIComponent(next)}`;
}

/** Build a safe return path from the current location. */
export function buildReturnToFromLocation(
  pathname: string,
  search = ""
): string {
  const query = search.startsWith("?") ? search : search ? `?${search}` : "";
  return sanitizePostAuthPath(`${pathname}${query}`);
}
