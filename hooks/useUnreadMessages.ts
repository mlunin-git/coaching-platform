import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getUnreadCount } from "@/lib/messaging";

/**
 * Custom React hook to track real-time unread message count for a user
 *
 * Provides real-time tracking of unread messages for coaches and clients with role-based filtering.
 * Coaches see unread messages from all their clients, while clients see unread messages from their coach.
 * Uses optimized, filtered subscriptions to avoid N+1 query problems.
 *
 * Features:
 * - Loads initial unread count on mount
 * - Real-time subscriptions to message changes (INSERT, UPDATE, DELETE)
 * - Role-based filtering: coaches see all client messages, clients see coach messages only
 * - Optimized subscriptions: only subscribes to relevant messages (no N+1 queries)
 * - Handles subscription lifecycle with cleanup
 * - Memory leak prevention with isMounted checks
 *
 * @param {string} userId - The unique ID of the user (coach or client, UUID format)
 * @param {string} userRole - The role/type of the user ("coach" or "client")
 *
 * @returns {Object} Unread message tracking state
 * @returns {number} unreadCount - Number of unread messages (0 if no unread messages)
 * @returns {string | null} error - Error message if subscription or initial load failed, null if successful
 * @returns {boolean} isSubscribed - Whether real-time subscription is currently active
 *
 * @example
 * // Coach dashboard showing total unread count from all clients
 * const { unreadCount, error, isSubscribed } = useUnreadMessages(coachId, "coach");
 *
 * return (
 *   <div className="flex items-center gap-2">
 *     <span>Messages</span>
 *     {unreadCount > 0 && (
 *       <span className="bg-red-500 text-white rounded-full px-2 py-1 text-sm">
 *         {unreadCount}
 *       </span>
 *     )}
 *     {error && <span className="text-red-600">{error}</span>}
 *     {!isSubscribed && !error && (
 *       <span className="text-gray-500 text-xs">(syncing...)</span>
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Client viewing unread message count from coach
 * const { unreadCount, error } = useUnreadMessages(clientUserId, "client");
 *
 * if (error) console.error("Failed to load unread count:", error);
 *
 * return (
 *   <button>
 *     Open messages {unreadCount > 0 && `(${unreadCount} new)`}
 *   </button>
 * );
 *
 * @remarks
 * - For coaches: Retrieves all client IDs, then subscribes to messages from those clients only
 * - For clients: Gets their client record ID, then subscribes to messages for that client only
 * - Subscription filter format: coach uses IN clause, client uses EQ clause
 * - Errors include both initial load failures and subscription setup failures
 * - isSubscribed is true only when subscription channel status is SUBSCRIBED
 */
export function useUnreadMessages(
  userId: string,
  userRole: "coach" | "client"
) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    // Initial load
    getUnreadCount(userId, userRole)
      .then((count) => {
        if (isMounted) {
          setUnreadCount(count);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load unread count");
          setUnreadCount(0);
        }
      });

    // For coaches: get their client IDs to filter subscription
    // For clients: subscribe to messages with their user_id
    const setupSubscription = async () => {
      try {
        const supabase = getSupabaseClient();
        let filter: string = "";

        if (userRole === "coach") {
          // Get coach's client IDs for filtered subscription
          const { data: clientsData, error: clientsError } = await supabase
            .from("clients")
            .select("id")
            .eq("coach_id", userId);

          if (clientsError) {
            if (isMounted) setError("Failed to setup subscriptions");
            return;
          }

          const clientIds = (clientsData || []).map((c) => c.id);
          if (clientIds.length === 0) return;

          // Filter subscription to only relevant clients
          filter = `client_id=in.(${clientIds.map((id) => `"${id}"`).join(",")})`;
        } else {
          // For clients: get their client record ID
          const { data: clientData } = await supabase
            .from("clients")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (!clientData?.id) return;
          filter = `client_id=eq.${clientData.id}`;
        }

        if (!isMounted) return;

        // Subscribe with optimized filter to only relevant messages
        const supabase2 = getSupabaseClient();
        const channel = supabase2
          .channel(`messages-unread-${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "messages",
              filter: filter,
            },
            () => {
              // Only refresh on relevant message changes
              if (isMounted) {
                getUnreadCount(userId, userRole)
                  .then((count) => {
                    if (isMounted) {
                      setUnreadCount(count);
                      setError(null);
                    }
                  })
                  .catch((err) => {
                    if (isMounted) {
                      setError(err instanceof Error ? err.message : "Failed to update unread count");
                    }
                  });
              }
            }
          )
          .subscribe((status) => {
            if (isMounted) {
              if (status === "CHANNEL_ERROR") {
                setError("Failed to subscribe to message updates");
                setIsSubscribed(false);
              } else if (status === "SUBSCRIBED") {
                setError(null);
                setIsSubscribed(true);
              }
            }
          });

        return () => {
          supabase2.removeChannel(channel);
        };
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to setup subscriptions");
        }
      }
    };

    const unsubscribe = setupSubscription().then((cleanup) => cleanup);

    return () => {
      isMounted = false;
      unsubscribe.then((cleanup) => cleanup?.());
    };
  }, [userId, userRole]);

  return { unreadCount, error, isSubscribed };
}
