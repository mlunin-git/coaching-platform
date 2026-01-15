import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getUnreadCount } from "@/lib/messaging";

/**
 * Hook to track unread message count for a user
 * Subscribes to real-time updates on the messages table
 * Uses filtered subscriptions to avoid N+1 query problem
 *
 * @param userId - The ID of the user (coach or client)
 * @param userRole - Whether the user is a "coach" or "client"
 * @returns Object with unreadCount, error state, and subscription status
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
