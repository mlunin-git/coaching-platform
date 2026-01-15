import { getSupabaseClient } from "./supabase";
import type { Database } from "./database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Get all messages for a specific client-coach conversation
 * @param clientId - The ID of the client
 * @returns Array of messages ordered by creation time
 * @throws Error with descriptive message if query fails
 */
export async function getMessages(clientId: string): Promise<Message[]> {
  if (!clientId) {
    throw new Error('clientId is required');
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clientId)) {
    throw new Error('Invalid clientId format');
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages for client ${clientId}: ${error.message}`);
    }

    // Validate response is array
    if (!Array.isArray(data)) {
      throw new Error('Invalid response: expected array of messages');
    }

    return data as Message[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch messages: ${String(error)}`);
  }
}

/**
 * Send a message in a conversation
 * @param clientId - The ID of the client
 * @param content - Message content
 * @param senderType - Who is sending ("coach" or "client")
 * @returns The created message
 * @throws Error if message send fails
 */
export async function sendMessage(
  clientId: string,
  content: string,
  senderType: "coach" | "client"
): Promise<Message> {
  if (!clientId || !content || !senderType) {
    throw new Error('clientId, content, and senderType are required');
  }

  if (content.length > 10000) {
    throw new Error('Message content exceeds maximum length of 10000 characters');
  }

  if (senderType !== "coach" && senderType !== "client") {
    throw new Error('senderType must be "coach" or "client"');
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        client_id: clientId,
        sender_type: senderType,
        content,
        is_read: false,
      })
      .select()
      .single()
      

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    if (!data) {
      throw new Error('No message returned after insert');
    }

    return data as Message;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to send message: ${String(error)}`);
  }
}

/**
 * Mark messages as read for the current user
 * Only marks messages sent by the OTHER party as read
 * @param clientId - The ID of the client
 * @param currentUserType - Type of the current user
 * @throws Error if operation fails
 */
export async function markMessagesAsRead(
  clientId: string,
  currentUserType: "coach" | "client"
): Promise<void> {
  if (!clientId) {
    throw new Error('clientId is required');
  }

  if (currentUserType !== "coach" && currentUserType !== "client") {
    throw new Error('currentUserType must be "coach" or "client"');
  }

  try {
    const supabase = getSupabaseClient();

    // Mark messages sent by the OTHER party as read
    const senderTypeToMarkRead = currentUserType === "coach" ? "client" : "coach";

    const { error } = await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("client_id", clientId)
      .eq("sender_type", senderTypeToMarkRead)
      .eq("is_read", false)
      

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to mark messages as read: ${String(error)}`);
  }
}

/**
 * Get unread message count for a user
 * @param userId - The ID of the user
 * @param userRole - Role of the user ("coach" or "client")
 * @returns Count of unread messages
 */
export async function getUnreadCount(
  userId: string,
  userRole: "coach" | "client"
): Promise<number> {
  if (!userId) {
    return 0;
  }

  if (userRole !== "coach" && userRole !== "client") {
    throw new Error('userRole must be "coach" or "client"');
  }

  try {
    const supabase = getSupabaseClient();

    if (userRole === "coach") {
      // For coaches: count unread messages from ALL their clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("coach_id", userId)
        

      if (clientsError) {
        console.error('Failed to fetch coach clients:', clientsError);
        throw new Error(`Failed to fetch clients: ${clientsError.message}`);
      }

      const clientIds = (clientsData || []).map((c) => c.id);
      if (clientIds.length === 0) return 0;

      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_type", "client")
        .eq("is_read", false)
        .in("client_id", clientIds)
        

      if (error) {
        console.error('Failed to count unread messages:', error);
        throw new Error(`Failed to count messages: ${error.message}`);
      }

      return count ?? 0;
    } else {
      // For clients: count unread messages from their coach
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", userId)
        .single()
        

      if (clientError) {
        // Client record not found is not a critical error
        console.warn('Client record not found for user:', userId);
        return 0;
      }

      if (!clientData?.id) {
        return 0;
      }

      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientData.id)
        .eq("sender_type", "coach")
        .eq("is_read", false)
        

      if (error) {
        console.error('Failed to count client unread messages:', error);
        throw new Error(`Failed to count messages: ${error.message}`);
      }

      return count ?? 0;
    }
  } catch (error) {
    console.error('Error getting unread count:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to get unread count: ${String(error)}`);
  }
}

/**
 * Get unread counts per client (for coach dashboard)
 * @param coachUserId - The ID of the coach
 * @returns Object mapping client IDs to unread counts
 */
export async function getUnreadCountsByClient(
  coachUserId: string
): Promise<Record<string, number>> {
  if (!coachUserId) {
    return {};
  }

  try {
    const supabase = getSupabaseClient();

    // Get all client IDs for this coach
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("id")
      .eq("coach_id", coachUserId)
      

    if (clientsError) {
      console.error('Failed to fetch coach clients for unread counts:', clientsError);
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    const clientIds = (clientsData || []).map((c) => c.id);
    if (clientIds.length === 0) return {};

    // Get all unread messages from clients
    const { data, error } = await supabase
      .from("messages")
      .select("client_id")
      .eq("sender_type", "client")
      .eq("is_read", false)
      .in("client_id", clientIds)
      

    if (error) {
      console.error('Failed to fetch unread messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    // Count messages per client
    const counts: Record<string, number> = {};
    (data || []).forEach((msg: { client_id: string }) => {
      counts[msg.client_id] = (counts[msg.client_id] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error getting unread counts by client:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to get unread counts: ${String(error)}`);
  }
}
