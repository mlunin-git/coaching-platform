"use client";

/**
 * Hook for tracking page views and session duration
 * Privacy-focused: no IP addresses, no PII for anonymous users
 * Session ID stored in sessionStorage (expires on tab close)
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import type { Database } from "@/lib/database.types";

type AnalyticsEventsInsert = Database["public"]["Tables"]["analytics_events"]["Insert"];

/**
 * Generate or retrieve session ID from sessionStorage
 * Session ID is unique per tab and expires when tab closes
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sessionId);
    sessionStorage.setItem("session_start", Date.now().toString());
  }
  return sessionId;
}

/**
 * Get the session start time from sessionStorage
 */
function getSessionStartTime(): Date {
  if (typeof window === "undefined") return new Date();

  const startTime = sessionStorage.getItem("session_start");
  return startTime ? new Date(parseInt(startTime)) : new Date();
}

/**
 * Track page views and session duration
 * Call this hook in a component that renders on all pages (like root layout)
 */
export function usePageTracking() {
  const pathname = usePathname();
  const pageStartTime = useRef<number>(0);
  const eventIdRef = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    const sessionId = getSessionId();
    const sessionStartedAt = getSessionStartTime();
    pageStartTime.current = Date.now();

    // Track page view
    const trackPageView = async () => {
      try {
        const supabase = getSupabaseClient();

        // Get authenticated user context if available
        let userId: string | null = null;
        let userRole: "coach" | "client" | "anonymous" = "anonymous";

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            // Fetch user profile to get role
            const { data: user, error } = await supabase
              .from("users")
              .select("id, role")
              .eq("auth_user_id", session.user.id)
              .single();

            if (user && !error) {
              userId = user.id;
              userRole = (user.role as "coach" | "client") || "anonymous";
            }
          }
        } catch (authError) {
          // User not authenticated, continue with anonymous tracking
          logger.debug("User not authenticated, tracking as anonymous", authError);
        }

        // Insert page view event
        const event: AnalyticsEventsInsert = {
          event_type: "page_view",
          page_path: pathname,
          session_id: sessionId,
          session_started_at: sessionStartedAt.toISOString(),
          user_id: userId,
          user_role: userRole,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          page_load_time: Math.round(performance.now()),
        };

        const { data, error } = await supabase
          .from("analytics_events")
          .insert(event)
          .select("id")
          .single();

        if (error) {
          logger.error("Failed to track page view", error);
        } else if (data) {
          eventIdRef.current = data.id;
        }
      } catch (error) {
        logger.error("Page tracking error", error);
      }
    };

    trackPageView();

    // Clean up and track time on page when component unmounts
    return () => {
      if (!eventIdRef.current) return;

      const timeOnPage = Date.now() - pageStartTime.current;

      // Update event with time spent on page
      const supabase = getSupabaseClient();
      supabase
        .from("analytics_events")
        .update({ time_on_page: timeOnPage })
        .eq("id", eventIdRef.current)
        .then(() => {
          // Success - logged implicitly
        })
        .catch((error) => {
          logger.error("Failed to update time on page", error);
        });
    };
  }, [pathname]);
}
