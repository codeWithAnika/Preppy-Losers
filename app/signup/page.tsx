import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import {
  buildAuthPageHref,
  resolvePostAuthPath,
} from "@/lib/auth/post-auth-redirect";

const GoogleAuthButton = dynamic(
  () =>
    import("@/components/auth/GoogleAuthButton").then((mod) => ({
      default: mod.GoogleAuthButton,
    })),
  { loading: () => <AuthFormPlaceholder /> }
);

export const metadata: Metadata = {
  title: "Sign up — Preppy Losers",
  description: "Create your Preppy Losers account.",
};

interface SignupPageProps {
  searchParams?: {
    next?: string;
    from?: string;
  };
}

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
      <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
    </div>
  );
}

function AuthFormPlaceholder() {
  return (
    <div
      className="h-11 animate-pulse border border-white/10 bg-white/[0.03]"
      aria-hidden="true"
    />
  );
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  const nextPath = resolvePostAuthPath(searchParams ?? {});
  const loginHref = buildAuthPageHref("/login", nextPath);

  return (
    <AuthShell
      title="Create account"
      subtitle="Join the drop list. One account for orders and archive access."
      footer={
        <p className="text-muted">
          Already have an account?{" "}
          <Link href={loginHref} className="text-foreground hover:text-accent">
            Sign in
          </Link>
        </p>
      }
    >
      <EmailAuthForm mode="signup" nextPath={nextPath} />

      <AuthDivider label="Or" />

      <GoogleAuthButton nextPath={nextPath} label="Sign up with Google" />
    </AuthShell>
  );
}
