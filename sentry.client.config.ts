import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "@/lib/env/public";

const tracesSampleRate = publicEnv.sentryEnabled
  ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1")
  : 0;

const replaysSessionSampleRate = publicEnv.sentryEnabled
  ? Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0.1")
  : 0;

const replaysOnErrorSampleRate = publicEnv.sentryEnabled ? 1.0 : 0;

Sentry.init({
  dsn: publicEnv.sentryDsn || undefined,
  enabled: publicEnv.sentryEnabled,
  environment: process.env.NODE_ENV,
  tracesSampleRate,
  replaysSessionSampleRate,
  replaysOnErrorSampleRate,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
