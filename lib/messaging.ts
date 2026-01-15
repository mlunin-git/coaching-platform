import { getSupabaseClient } from "./supabase";
import type { Database } from "./database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Get all messages for a specific client-coach conversation
 */
export async function getMessages(clientId: string): Promise<Message[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Message[];
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  clientId: string,
  content: string,
  senderType: "coach" | "client"
): Promise<Message> {
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
    .single();

  if (error) throw error;
  return data as Message;
}

/**
 * Mark messages as read for the current user
 * Only marks messages sent by the OTHER party as read
 */
export async function markMessagesAsRead(
  clientId: string,
  currentUserType: "coach" | "client"
): Promise<void> {
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
    .eq("is_read", false);

  if (error) throw error;
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(
  userId: string,
  userRole: "coach" | "client"
): Promise<number> {
  const supabase = getSupabaseClient();

  if (userRole === "coach") {
    // For coaches: count unread messages from ALL their clients
    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("id")
      .eq("coach_id", userId);

    if (clientsError) throw clientsError;

    const clientIds = (clientsData || []).map((c) => c.id);
    if (clientIds.length === 0) return 0;

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_type", "client")
      .eq("is_read", false)
      .in("client_id", clientIds);

    if (error) throw error;
    return count || 0;
  } else {
    // For clients: count unread messages from their coach
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (clientError) return 0;
    if (!clientData) return 0;

    const clientId = clientData?.id;
    if (!clientId) return 0;

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .eq("sender_type", "coach")
      .eq("is_read", false);

    if (error) throw error;
    return count || 0;
  }
}

/**
 * Get unread counts per client (for coach dashboard)
 */
export async function getUnreadCountsByClient(
  coachUserId: string
): Promise<Record<string, number>> {
  const supabase = getSupabaseClient();

  // Get all client IDs for this coach
  const { data: clientsData, error: clientsError } = await supabase
    .from("clients")
    .select("id")
    .eq("coach_id", coachUserId);

  if (clientsError) throw clientsError;

  const clientIds = (clientsData || []).map((c) => c.id);
  if (clientIds.length === 0) return {};

  // Get all unread messages from clients
  const { data, error } = await supabase
    .from("messages")
    .select("client_id")
    .eq("sender_type", "client")
    .eq("is_read", false)
    .in("client_id", clientIds);

  if (error) throw error;

  // Count messages per client
  const counts: Record<string, number> = {};
  (data || []).forEach((msg) => {
    counts[msg.client_id] = (counts[msg.client_id] || 0) + 1;
  });

  return counts;
}
