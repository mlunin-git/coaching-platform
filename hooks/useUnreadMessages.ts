import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getUnreadCount } from "@/lib/messaging";

/**
 * Hook to track unread message count for a user
 * Subscribes to real-time updates on the messages table
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

  useEffect(() => {
    if (!userId) return;

    // Initial load
    getUnreadCount(userId, userRole)
      .then((count) => {
        setUnreadCount(count);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load unread count");
        setUnreadCount(0);
      });

    // Subscribe to real-time updates
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("messages-unread")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          // Refresh count on any message change
          getUnreadCount(userId, userRole)
            .then((count) => {
              setUnreadCount(count);
              setError(null);
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "Failed to update unread count");
            });
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Failed to subscribe to message updates");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  return { unreadCount, error };
}
