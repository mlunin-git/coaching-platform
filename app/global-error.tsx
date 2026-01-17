/**
 * Global Error Handler
 *
 * Catches unhandled errors that occur during app rendering.
 * This is required to handle React rendering errors and report them to Sentry.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/error-handling#global-errors
 */

"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report error to Sentry
    Sentry.captureException(error, {
      tags: {
        component: "global-error",
      },
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#d32f2f", marginBottom: "20px" }}>
              Something went wrong
            </h1>

            <p style={{ color: "#666", marginBottom: "20px", lineHeight: "1.5" }}>
              We've been notified about this error and will investigate it. Please try
              again in a moment.
            </p>

            {process.env.NODE_ENV === "development" && error.message && (
              <details
                style={{
                  textAlign: "left",
                  marginBottom: "20px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
                  Error Details (Development Only)
                </summary>
                <pre
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    overflow: "auto",
                    color: "#d32f2f",
                  }}
                >
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}

            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#1565c0";
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#1976d2";
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
