import "server-only";

/**
 * Server-only environment access. Import only from Server Components,
 * Route Handlers, and server utilities — never from client components.
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverEnv = {
  get supabaseServiceRoleKey(): string {
    return requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  },

  get sentryDsn(): string | undefined {
    return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  },

  get forceHttps(): boolean {
    return process.env.FORCE_HTTPS === "true";
  },

  /** Custom TLS cert paths for reverse-proxy / Node HTTPS (optional). */
  get tlsCertPath(): string | undefined {
    return process.env.SSL_CERT_PATH;
  },

  get tlsKeyPath(): string | undefined {
    return process.env.SSL_KEY_PATH;
  },

  get tlsCaPath(): string | undefined {
    return process.env.SSL_CA_PATH;
  },

  get resendApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  },

  get resendFromEmail(): string | undefined {
    return process.env.RESEND_FROM_EMAIL;
  },
} as const;

/** Names of secrets that must never appear in client bundles or logs. */
export const SECRET_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "SENTRY_AUTH_TOKEN",
  "RESEND_API_KEY",
] as const;
