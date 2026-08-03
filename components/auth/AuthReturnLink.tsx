"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/client";
import {
  buildAuthPageHref,
  buildReturnToFromLocation,
} from "@/lib/auth/post-auth-redirect";

interface AuthReturnLinkProps {
  children: ReactNode;
  className?: string;
  loggedInHref?: string;
  authPage?: "/login" | "/signup";
}

/**
 * Account/login link: signed-in users go to account; signed-out users go to
 * auth with ?next= set to the page they were on.
 */
export function AuthReturnLink({
  children,
  className = "",
  loggedInHref = "/account",
  authPage = "/login",
}: AuthReturnLinkProps) {
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  const returnTo = useMemo(
    () => buildReturnToFromLocation(pathname),
    [pathname]
  );

  const signedOutHref = useMemo(
    () => buildAuthPageHref(authPage, returnTo),
    [authPage, returnTo]
  );

  useEffect(() => {
    const supabase = createClient();

    const syncSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsSignedIn(Boolean(user));
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  const href =
    isSignedIn === null ? signedOutHref : isSignedIn ? loggedInHref : signedOutHref;

  return (
    <TransitionLink href={href} className={className}>
      {children}
    </TransitionLink>
  );
}
