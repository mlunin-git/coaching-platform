import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getMessages, markMessagesAsRead } from "@/lib/messaging";
import type { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Hook to manage real-time messaging between coaches and clients
 * Loads initial messages and subscribes to new message inserts
 * Automatically marks messages as read when viewed
 * Includes error recovery and retry logic
 *
 * @param clientId - The ID of the client for the conversation
 * @param currentUserType - The type of user making the query ("coach" or "client")
 * @returns Object with messages array, loading state, error, and refresh function
 */
export function useRealtimeMessages(
  clientId: string,
  currentUserType: "coach" | "client"
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoadError(null);
      const data = await getMessages(clientId);
      setMessages(data);

      // Mark messages as read when viewing
      await markMessagesAsRead(clientId, currentUserType);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load messages";
      setLoadError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [clientId, currentUserType]);

  useEffect(() => {
    loadMessages();

    if (!clientId) return;

    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;

    const setupSubscription = () => {
      try {
        // Validate clientId is a proper UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(clientId)) {
          if (isMounted) {
            setError("Invalid client ID format");
          }
          return;
        }

        // Subscribe to real-time updates
        const supabase = getSupabaseClient();
        const channel = supabase
          .channel(`messages-${clientId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `client_id=eq.${clientId}`,
            },
            (payload) => {
              if (isMounted) {
                setMessages((prev) => [...prev, payload.new as Message]);

                // Auto-mark as read if it's from the other party
                if (payload.new.sender_type !== currentUserType) {
                  markMessagesAsRead(clientId, currentUserType).catch((err) => {
                    if (isMounted) {
                      const msg = err instanceof Error ? err.message : "Failed to mark as read";
                      setError(`Mark read failed: ${msg}`);
                    }
                  });
                }
              }
            }
          )
          .subscribe((status) => {
            if (isMounted) {
              if (status === "CHANNEL_ERROR") {
                setError("Real-time sync failed - attempting to reconnect");
                // Retry with exponential backoff
                const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                setTimeout(() => {
                  if (isMounted && retryCount < maxRetries) {
                    retryCount++;
                    setupSubscription();
                  } else if (isMounted && retryCount >= maxRetries) {
                    setError("Real-time sync unavailable - please refresh to see new messages");
                  }
                }, delay);
              } else if (status === "SUBSCRIBED") {
                // Only clear subscription errors, preserve load errors
                if (!loadError) {
                  setError(null);
                }
                retryCount = 0; // Reset retry count on successful connection
              }
            }
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to setup subscription";
          setError(`Subscription error: ${msg}`);
        }
      }
    };

    const cleanup = setupSubscription();

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [clientId, currentUserType, loadMessages, loadError]);

  // Return the most relevant error - load error takes precedence
  const effectiveError = loadError || error;

  return { messages, loading, error: effectiveError, refreshMessages: loadMessages };
}
