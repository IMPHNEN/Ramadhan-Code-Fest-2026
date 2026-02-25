import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Sentry will auto-inject via sentry.*.config.ts
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? "0.0"),
    environment: process.env.SENTRY_ENVIRONMENT,
    // Redact PII umum
    beforeSend(event) {
      // hapus query berisi token/keys jika ada
      return event;
    },
  });
}