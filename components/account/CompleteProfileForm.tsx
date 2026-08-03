"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { createClient } from "@/lib/supabase/client";

interface CompleteProfileFormProps {
  initialName: string;
  nextPath: string;
}

export function CompleteProfileForm({
  initialName,
  nextPath,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: trimmedName })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-foreground/70">
        We need your name to complete your account. Google may have prefilled it
        below — you can edit it before continuing.
      </p>

      <AuthField
        label="Full name"
        type="text"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Your full name"
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
        {loading ? "Saving..." : "Continue"}
      </MagneticGlitchButton>
    </form>
  );
}
