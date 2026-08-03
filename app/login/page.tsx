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

const PhoneOtpForm = dynamic(
  () =>
    import("@/components/auth/PhoneOtpForm").then((mod) => ({
      default: mod.PhoneOtpForm,
    })),
  { loading: () => <AuthFormPlaceholder /> }
);

export const metadata: Metadata = {
  title: "Sign in — Preppy Losers",
  description: "Sign in to your Preppy Losers account.",
};

interface LoginPageProps {
  searchParams?: {
    next?: string;
    from?: string;
    error?: string;
    reason?: string;
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

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = resolvePostAuthPath(searchParams ?? {});
  const signupHref = buildAuthPageHref("/signup", nextPath);
  const authError =
    searchParams?.error === "auth_callback_failed"
      ? searchParams.reason
        ? `Sign-in failed: ${searchParams.reason}`
        : "Sign-in could not be completed. Please try again."
      : searchParams?.error === "rate_limited"
        ? "Too many sign-in attempts. Please wait 15 minutes and try again."
        : null;

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your account, orders, and drops."
      footer={
        <p className="text-muted">
          New here?{" "}
          <Link href={signupHref} className="text-foreground hover:text-accent">
            Create an account
          </Link>
        </p>
      }
    >
      {authError && (
        <p className="mb-6 text-xs text-accent" role="alert">
          {authError}
        </p>
      )}

      <EmailAuthForm mode="login" nextPath={nextPath} />

      <AuthDivider label="Or" />

      <GoogleAuthButton nextPath={nextPath} />

      <AuthDivider label="Phone" />

      <PhoneOtpForm nextPath={nextPath} />
    </AuthShell>
  );
}
