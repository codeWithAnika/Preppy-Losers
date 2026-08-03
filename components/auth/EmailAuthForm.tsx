"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthField } from "@/components/auth/AuthField";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import {
  buildAuthPageHref,
  DEFAULT_POST_AUTH_REDIRECT,
} from "@/lib/auth/post-auth-redirect";
import { requestEmailNotification } from "@/lib/email/notify-client";

interface EmailAuthFormProps {
  mode: "login" | "signup";
  nextPath?: string;
}

export function EmailAuthForm({
  mode,
  nextPath = DEFAULT_POST_AUTH_REDIRECT,
}: EmailAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          void requestEmailNotification({
            type: "welcome",
            customerName: fullName.trim(),
          });
          router.push(nextPath);
          router.refresh();
          return;
        }

        setMessage("Check your email to confirm your account, then sign in.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const alternateAuthHref =
    mode === "login"
      ? buildAuthPageHref("/signup", nextPath)
      : buildAuthPageHref("/login", nextPath);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "signup" && (
        <AuthField
          label="Full name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />
      )}

      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <AuthField
        label="Password"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      {error && (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="text-xs text-foreground/70" role="status">
          {message}
        </p>
      )}

      <MagneticGlitchButton
        type="submit"
        variant="outline"
        disabled={loading}
        className="w-full"
      >
        {loading
          ? mode === "signup"
            ? "Creating account..."
            : "Signing in..."
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </MagneticGlitchButton>

      <p className="text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href={alternateAuthHref} className="text-foreground hover:text-accent">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={alternateAuthHref} className="text-foreground hover:text-accent">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
