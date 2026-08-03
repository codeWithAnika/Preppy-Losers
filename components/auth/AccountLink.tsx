"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  buildAuthPageHref,
  buildReturnToFromLocation,
} from "@/lib/auth/post-auth-redirect";
import { isAdmin } from "@/lib/auth/admin-allowlist";

interface AccountLinkProps {
  size?: number;
  className?: string;
}

export function AccountLink({ size = 20, className = "" }: AccountLinkProps) {
  const pathname = usePathname();
  const [href, setHref] = useState("/login");

  const returnTo = useMemo(
    () => buildReturnToFromLocation(pathname),
    [pathname]
  );

  useEffect(() => {
    const supabase = createClient();
    const signedOutHref = buildAuthPageHref("/login", returnTo);

    const syncHref = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHref(signedOutHref);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (process.env.NODE_ENV === "development") {
        console.log("[admin] AccountLink profile", {
          userId: user.id,
          profileRole: profile?.role ?? null,
        });
      }

      setHref(isAdmin(user.id, profile?.role) ? "/admin/dashboard" : "/account");
    };

    syncHref();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncHref();
    });

    return () => subscription.unsubscribe();
  }, [returnTo]);

  return (
    <TransitionLink
      href={href}
      aria-label="Account"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground ${className}`}
    >
      <User size={size} strokeWidth={1.5} />
    </TransitionLink>
  );
}
