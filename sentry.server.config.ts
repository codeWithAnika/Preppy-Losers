import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env/public";

Sentry.init({
  dsn: publicEnv.sentryDsn || undefined,
  enabled: publicEnv.sentryEnabled,
  environment: process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
});
