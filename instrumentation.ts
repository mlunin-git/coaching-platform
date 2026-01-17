/**
 * Next.js Server Instrumentation
 *
 * Initialize server-side monitoring for Sentry and performance tracking.
 * This file is required for proper Sentry SDK initialization on the server.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side initialization
    const { initServerSentry } = await import("@/lib/sentry-server");
    initServerSentry();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime initialization if needed
    const { initEdgeSentry } = await import("@/lib/sentry-edge");
    initEdgeSentry();
  }
}
