"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <MagneticGlitchButton
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleSignOut}
      className="w-full md:w-auto"
    >
      {loading ? "Signing out..." : "Sign out"}
    </MagneticGlitchButton>
  );
}
