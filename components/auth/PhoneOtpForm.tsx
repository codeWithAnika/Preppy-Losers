"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthField } from "@/components/auth/AuthField";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { requestWhatsAppNotification } from "@/lib/whatsapp/notify-client";
import { DEFAULT_POST_AUTH_REDIRECT } from "@/lib/auth/post-auth-redirect";

interface PhoneOtpFormProps {
  nextPath?: string;
}

type Step = "phone" | "otp" | "name";

/** True when auth.users was created moments ago (first-time phone signup). */
function isNewlyCreatedUser(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 120_000;
}

function normalizePhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `+${trimmed.replace(/\D/g, "")}`;
}

async function fetchProfileFullName(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    if (data) return data.full_name;

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return null;
}

export function PhoneOtpForm({ nextPath = DEFAULT_POST_AUTH_REDIRECT }: PhoneOtpFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeSignIn = () => {
    router.push(nextPath);
    router.refresh();
  };

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const normalizedPhone = normalizePhone(phone);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setPhone(normalizedPhone);
      setStep("otp");
    } catch {
      setError("Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp.trim(),
        type: "sms",
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Sign-in could not be completed. Please try again.");
        return;
      }

      const isFirstTimeSignup = isNewlyCreatedUser(user.created_at);
      if (!isFirstTimeSignup) {
        completeSignIn();
        return;
      }

      const existingName = await fetchProfileFullName(supabase, user.id);
      if (existingName?.trim()) {
        completeSignIn();
        return;
      }

      setUserId(user.id);
      setStep("name");
    } catch {
      setError("Unable to verify code.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError("Please enter your full name.");
      return;
    }
    if (!userId) {
      setError("Session expired. Please verify your phone again.");
      setStep("phone");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: trimmed })
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      void requestWhatsAppNotification({
        type: "welcome",
        phone,
        customerName: trimmed,
      });

      completeSignIn();
    } catch {
      setError("Unable to save your name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "name") {
    return (
      <form onSubmit={handleSaveName} className="space-y-5">
        <p className="text-sm text-foreground/70">
          Welcome — what should we call you?
        </p>

        <AuthField
          label="Full name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />

        {error && (
          <p className="text-xs text-accent" role="alert">
            {error}
          </p>
        )}

        <MagneticGlitchButton
          type="submit"
          variant="outline"
          disabled={loading || !fullName.trim()}
          className="w-full"
        >
          {loading ? "Saving..." : "Continue"}
        </MagneticGlitchButton>
      </form>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-5">
        <p className="text-sm text-foreground/70">
          Enter the 6-digit code sent to{" "}
          <span className="text-foreground">{phone}</span>
        </p>

        <AuthField
          label="Verification code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="tracking-[0.5em]"
        />

        {error && (
          <p className="text-xs text-accent" role="alert">
            {error}
          </p>
        )}

        <MagneticGlitchButton
          type="submit"
          variant="outline"
          disabled={loading || otp.length !== 6}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify & sign in"}
        </MagneticGlitchButton>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setOtp("");
            setError(null);
          }}
          className="w-full text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
        >
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-5">
      <AuthField
        label="Phone number"
        type="tel"
        autoComplete="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+91 98765 43210"
      />

      {error && (
        <p className="text-xs text-accent" role="alert">
          {error}
        </p>
      )}

      <MagneticGlitchButton
        type="submit"
        variant="outline"
        disabled={loading || !phone.trim()}
        className="w-full"
      >
        {loading ? "Sending code..." : "Send verification code"}
      </MagneticGlitchButton>
    </form>
  );
}
