import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { getMessages, markMessagesAsRead } from "@/lib/messaging";
import type { Database } from "@/lib/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export function useRealtimeMessages(
  clientId: string,
  currentUserType: "coach" | "client"
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getMessages(clientId);
      setMessages(data);

      // Mark messages as read when viewing
      await markMessagesAsRead(clientId, currentUserType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [clientId, currentUserType]);

  useEffect(() => {
    loadMessages();

    if (!clientId) return;

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
          setMessages((prev) => [...prev, payload.new as Message]);

          // Auto-mark as read if it's from the other party
          if (payload.new.sender_type !== currentUserType) {
            markMessagesAsRead(clientId, currentUserType).catch((err) => {
              setError(err instanceof Error ? err.message : "Failed to mark as read");
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Failed to subscribe to messages");
        } else if (status === "SUBSCRIBED") {
          setError(null);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, currentUserType, loadMessages]);

  return { messages, loading, error, refreshMessages: loadMessages };
}
