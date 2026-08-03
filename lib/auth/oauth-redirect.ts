import { sanitizePostAuthPath } from "@/lib/auth/post-auth-redirect";

/** Build the OAuth return URL passed to Supabase signInWithOAuth. */
export function buildOAuthCallbackUrl(origin: string, nextPath?: string): string {
  const safeNext = sanitizePostAuthPath(nextPath);
  return `${origin.replace(/\/$/, "")}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

/**
 * Resolve redirect origin after OAuth.
 * Prefer the incoming request origin so Set-Cookie domain matches the host
 * the user actually used (avoids www/apex mismatches and redirect loops).
 */
export function resolveAuthRedirectOrigin(
  request: Request,
  fallbackOrigin: string
): string {
  const requestOrigin = new URL(request.url).origin;
  const hostname = new URL(requestOrigin).hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return requestOrigin;
  }

  return requestOrigin || fallbackOrigin;
}
