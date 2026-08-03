"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <AuthShell
        title="Reset password"
        subtitle="Open the reset link from your email to set a new password."
        footer={
          <p className="text-muted">
            <Link href="/login/forgot-password" className="text-foreground hover:text-accent">
              Request a new link
            </Link>
          </p>
        }
      >
        <p className="text-sm text-foreground/70">
          Waiting for a valid reset session. If you opened this page directly,
          use the link in your email or request a new one.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set new password"
      subtitle="Choose a new password for your account."
      footer={
        <p className="text-muted">
          <Link href="/login" className="text-foreground hover:text-accent">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AuthField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && (
          <p className="text-xs text-accent" role="alert">
            {error}
          </p>
        )}

        <MagneticGlitchButton
          type="submit"
          variant="outline"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating..." : "Update password"}
        </MagneticGlitchButton>
      </form>
    </AuthShell>
  );
}
