"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildOAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import {
  DEFAULT_POST_AUTH_REDIRECT,
  sanitizePostAuthPath,
} from "@/lib/auth/post-auth-redirect";

interface GoogleAuthButtonProps {
  nextPath?: string;
  label?: string;
}

export function GoogleAuthButton({
  nextPath = DEFAULT_POST_AUTH_REDIRECT,
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const safeNext = sanitizePostAuthPath(nextPath);
      const redirectTo = buildOAuthCallbackUrl(window.location.origin, safeNext);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: false,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
      // On success the browser navigates away — keep loading state as-is.
    } catch {
      setError("Unable to start Google sign-in. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <MagneticGlitchButton
        type="button"
        variant="outline"
        disabled={loading}
        onClick={handleGoogleSignIn}
        className="w-full"
        aria-busy={loading}
      >
        {loading ? "Redirecting..." : label}
      </MagneticGlitchButton>
      {error && (
        <p className="mt-3 text-center text-xs text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
