import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getMessages, markMessagesAsRead } from "@/lib/messaging";
import type { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Custom React hook for real-time messaging between coaches and clients
 *
 * Manages the complete messaging lifecycle: loads initial conversation history,
 * subscribes to real-time message updates via Supabase, automatically marks messages as read,
 * and handles connection errors with exponential backoff retry logic.
 *
 * Features:
 * - Loads complete message history on mount
 * - Real-time subscriptions to new messages via Supabase postgres_changes
 * - Auto-marks incoming messages as read
 * - Error recovery with exponential backoff (max 5 retries)
 * - Prevents memory leaks with cleanup and isMounted checks
 * - Validates clientId format as UUID before subscribing
 *
 * @param {string} clientId - The unique ID of the client for this conversation (UUID format)
 * @param {string} currentUserType - The type/role of the current user ("coach" or "client")
 *
 * @returns {Object} Messaging state and utilities
 * @returns {Message[]} messages - Array of Message objects in chronological order
 * @returns {boolean} loading - Whether initial messages are being loaded
 * @returns {string | null} error - Error message if subscription or initial load failed, null otherwise
 * @returns {Function} refreshMessages - Function to manually reload messages from database
 *
 * @example
 * // Coach viewing client conversation
 * const { messages, loading, error, refreshMessages } = useRealtimeMessages(
 *   clientId,
 *   "coach"
 * );
 *
 * if (loading) return <div>Loading messages...</div>;
 * if (error) return <div className="text-red-500">{error}</div>;
 *
 * return (
 *   <div className="space-y-4">
 *     {messages.map(msg => (
 *       <div key={msg.id} className={msg.sender_type === "coach" ? "text-blue-600" : "text-gray-700"}>
 *         {msg.content}
 *       </div>
 *     ))}
 *     <button onClick={refreshMessages}>Refresh messages</button>
 *   </div>
 * );
 *
 * @remarks
 * - Errors take precedence: load errors override subscription errors in return value
 * - Retry logic uses exponential backoff: 1s, 2s, 4s, 8s, 16s (max 30s)
 * - Real-time sync automatically marks messages from other party as read
 * - Empty clientId will skip subscription setup but still return loading state
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
