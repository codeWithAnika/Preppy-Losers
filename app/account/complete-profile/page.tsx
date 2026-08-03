import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompleteProfileForm } from "@/components/account/CompleteProfileForm";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  isProfileComplete,
  PROFILE_COMPLETION_PATH,
} from "@/lib/auth/profile-completion";
import { resolvePostAuthPath } from "@/lib/auth/post-auth-redirect";
import { getProfile } from "@/lib/profile.server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Complete your profile — Preppy Losers",
  description: "Add your name to finish setting up your account.",
};

export const dynamic = "force-dynamic";

interface CompleteProfilePageProps {
  searchParams?: {
    next?: string;
  };
}

export default async function CompleteProfilePage({
  searchParams,
}: CompleteProfilePageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(PROFILE_COMPLETION_PATH)}`);
  }

  const profile = await getProfile(user.id);
  const nextPath = resolvePostAuthPath(searchParams ?? {});

  if (isProfileComplete(profile)) {
    redirect(nextPath);
  }

  const initialName =
    profile?.full_name?.trim() ||
    (typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "");

  return (
    <AuthShell
      title="Complete your profile"
      subtitle="Add your name to continue."
    >
      <CompleteProfileForm initialName={initialName} nextPath={nextPath} />
    </AuthShell>
  );
}
