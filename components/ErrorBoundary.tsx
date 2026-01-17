"use client";

import React, { ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches React errors and reports to Sentry
 * Provides a fallback UI when an error occurs
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    logger.error("Error caught by boundary:", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We&apos;ve been notified about this error and are working to fix it.
                </p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = "/";
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
