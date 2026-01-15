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

  const loadMessages = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getMessages(clientId);
      setMessages(data);

      // Mark messages as read when viewing
      await markMessagesAsRead(clientId, currentUserType);
    } catch (error) {
      console.error("Error loading messages:", error);
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
            markMessagesAsRead(clientId, currentUserType).catch((error) => {
              console.error("Error marking messages as read:", error);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, currentUserType, loadMessages]);

  return { messages, loading, refreshMessages: loadMessages };
}
