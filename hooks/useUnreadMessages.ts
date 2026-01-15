import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getUnreadCount } from "@/lib/messaging";

export function useUnreadMessages(
  userId: string,
  userRole: "coach" | "client"
) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Initial load
    getUnreadCount(userId, userRole)
      .then(setUnreadCount)
      .catch((error) => {
        console.error("Error loading unread count:", error);
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
            .then(setUnreadCount)
            .catch((error) => {
              console.error("Error updating unread count:", error);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole]);

  return unreadCount;
}
