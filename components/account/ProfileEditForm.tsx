"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthField } from "@/components/auth/AuthField";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { createClient } from "@/lib/supabase/client";

interface ProfileEditFormProps {
  initialName: string;
}

export function ProfileEditForm({ initialName }: ProfileEditFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

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

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-white/10 pt-6">
      <h3 className="text-xs uppercase tracking-[0.25em] text-muted">
        Edit profile
      </h3>

      <AuthField
        label="Full name"
        type="text"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      {error && (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-foreground/70" role="status">
          Profile updated.
        </p>
      )}

      <MagneticGlitchButton
        type="submit"
        variant="outline"
        disabled={loading}
        className="w-full md:w-auto"
      >
        {loading ? "Saving..." : "Save changes"}
      </MagneticGlitchButton>
    </form>
  );
}
