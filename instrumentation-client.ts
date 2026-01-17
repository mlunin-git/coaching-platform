/**
 * Next.js Client Instrumentation
 *
 * Initialize client-side monitoring for Sentry and performance tracking.
 * This replaces the deprecated sentry.client.config.ts approach.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

export function register() {
  if (typeof window !== "undefined") {
    // Client-side initialization
    import("@/lib/sentry-client").then(({ initClientSentry }) => {
      initClientSentry();
    });
  }
}
