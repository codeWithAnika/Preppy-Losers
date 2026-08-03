"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
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
      const redirectTo = `${window.location.origin}/login/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage(
        "If an account exists for that email, you will receive a password reset link shortly."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <p className="text-muted">
          Remember your password?{" "}
          <Link href="/login" className="text-foreground hover:text-accent">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
          {loading ? "Sending..." : "Send reset link"}
        </MagneticGlitchButton>
      </form>
    </AuthShell>
  );
}
