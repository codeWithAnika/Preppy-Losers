import { type NextRequest, NextResponse } from "next/server";
import { isProduction } from "@/lib/env/public";
import {
  applyRateLimitHeaders,
  AUTH_RATE_LIMIT,
  GENERAL_RATE_LIMIT,
  getClientIp,
  rateLimit,
} from "@/lib/rate-limit";
import { getCorsHeaders } from "@/lib/security/cors";
import { getSecurityHeaders } from "@/lib/security/headers";
import { updateSession } from "@/lib/supabase/middleware";

/** Brute-force sensitive pages only — exclude /auth/callback (OAuth return from Google). */
const AUTH_RATE_LIMIT_PATHS = ["/login", "/signup"];

function isAuthRateLimitPath(pathname: string): boolean {
  return AUTH_RATE_LIMIT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function shouldForceHttps(request: NextRequest): boolean {
  if (!isProduction()) {
    return false;
  }

  if (process.env.FORCE_HTTPS !== "true") {
    return false;
  }

  const hostname = request.nextUrl.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return false;
  }

  // Only redirect when the client explicitly used HTTP.
  // Missing x-forwarded-proto (common on local `next start`) must NOT trigger
  // a redirect — that causes ERR_TOO_MANY_REDIRECTS.
  const proto = request.headers.get("x-forwarded-proto");
  return proto === "http";
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders({ includeHsts: isProduction() });

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  if (shouldForceHttps(request)) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  // OAuth callback: skip session refresh so PKCE cookies are not mutated before
  // the route handler runs exchangeCodeForSession().
  if (pathname === "/auth/callback") {
    return withSecurityHeaders(NextResponse.next({ request }));
  }

  if (pathname.startsWith("/api/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request.headers.get("origin")),
      });
    }

    const limitResult = rateLimit(ip, GENERAL_RATE_LIMIT, "api");

    if (!limitResult.success) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      applyRateLimitHeaders(response.headers, limitResult);
      return withSecurityHeaders(response);
    }
  }

  if (isAuthRateLimitPath(pathname)) {
    const authLimit = rateLimit(ip, AUTH_RATE_LIMIT, "auth");

    if (!authLimit.success) {
      const response = NextResponse.redirect(
        new URL("/login?error=rate_limited", request.url)
      );
      applyRateLimitHeaders(response.headers, authLimit);
      return withSecurityHeaders(response);
    }
  }

  const generalLimit = rateLimit(ip, GENERAL_RATE_LIMIT, "general");

  if (!generalLimit.success) {
    const response = new NextResponse("Too many requests", { status: 429 });
    applyRateLimitHeaders(response.headers, generalLimit);
    return withSecurityHeaders(response);
  }

  const sessionResponse = await updateSession(request);
  applyRateLimitHeaders(sessionResponse.headers, generalLimit);

  if (pathname.startsWith("/api/")) {
    const corsHeaders = getCorsHeaders(request.headers.get("origin"));
    for (const [key, value] of Object.entries(corsHeaders)) {
      sessionResponse.headers.set(key, value as string);
    }
  }

  return withSecurityHeaders(sessionResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|otf|woff|woff2)$).*)",
  ],
};
