import { NextResponse, type NextRequest } from "next/server";
import {
  isProfileComplete,
  PROFILE_COMPLETION_PATH,
} from "@/lib/auth/profile-completion";
import { resolvePostAuthPath } from "@/lib/auth/post-auth-redirect";
import { resolveAuthRedirectOrigin } from "@/lib/auth/oauth-redirect";
import { sendWelcomeEmail } from "@/lib/email/notifications";
import { logger } from "@/lib/logging/logger";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function isNewlyCreatedUser(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 120_000;
}

function buildLoginErrorRedirect(
  origin: string,
  reason?: string | null
): NextResponse {
  const url = new URL("/login", origin);
  url.searchParams.set("error", "auth_callback_failed");
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 200));
  }
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const oauthError = requestUrl.searchParams.get("error");
  const oauthErrorDescription = requestUrl.searchParams.get("error_description");
  const next = resolvePostAuthPath({
    next: requestUrl.searchParams.get("next"),
    from: requestUrl.searchParams.get("from"),
  });
  const origin = resolveAuthRedirectOrigin(request, requestUrl.origin);

  if (oauthError) {
    const reason = oauthErrorDescription ?? oauthError;
    logger.error("auth", "OAuth provider returned error", undefined, {
      meta: { error: oauthError, description: oauthErrorDescription },
    });
    return buildLoginErrorRedirect(origin, reason);
  }

  if (!code) {
    logger.warn("auth", "OAuth callback missing code", {
      meta: { path: requestUrl.pathname },
    });
    return buildLoginErrorRedirect(origin);
  }

  try {
    const cookieResponse = NextResponse.next();
    const supabase = createRouteHandlerClient(request, cookieResponse);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("auth", "OAuth code exchange failed", error, {
        meta: { next, message: error.message },
      });
      return buildLoginErrorRedirect(origin, error.message);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let destination = next;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!isProfileComplete(profile)) {
        destination = `${PROFILE_COMPLETION_PATH}?next=${encodeURIComponent(next)}`;
      }
    }

    const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
    cookieResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    if (user?.email && isNewlyCreatedUser(user.created_at)) {
      const fullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : undefined;

      const welcomeResult = await sendWelcomeEmail({
        to: user.email,
        customerName: fullName,
      });

      if (!welcomeResult.success) {
        logger.warn("auth", "Welcome email failed on auth callback", {
          userId: user.id,
          meta: { error: welcomeResult.error },
        });
      }
    }

    return redirectResponse;
  } catch (error) {
    logger.error("auth", "OAuth callback exception", error);
    const message = error instanceof Error ? error.message : undefined;
    return buildLoginErrorRedirect(origin, message);
  }
}
